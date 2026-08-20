import { useState } from "react";
import { predictPrice } from "../api/api";
import { DEFAULT_PROPERTY_VALUES } from "../config/propertyFields";
import QuickPasteInput from "./QuickPasteInput";

// Sourced from the centralized field config so Quick Paste, the CSV
// batch uploader, and this form all agree on field keys and defaults.
const initialForm = DEFAULT_PROPERTY_VALUES;

const PredictionForm = ({ onPrediction }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Field keys that Quick Paste couldn't parse cleanly, so we can
  // highlight them without ever writing a bad value into `form`.
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Once the user edits a flagged field themselves, clear the flag.
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Quick Paste hands us only the values that parsed successfully —
  // this merges them into the existing form state without touching
  // fields it couldn't confidently read, then flags those for review.
  const handleQuickFill = (values, parseErrors) => {
    setForm((prev) => ({
      ...prev,
      ...values,
    }));

    const errorMap = {};
    parseErrors.forEach((err) => {
      if (err.field) {
        errorMap[err.field] = err.message;
      }
    });
    setFieldErrors(errorMap);
  };

  const handleResetForm = () => {
    setForm(initialForm);
    setFieldErrors({});
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        area: Number(form.area),
        num_bath_rooms: Number(form.num_bath_rooms),
        num_bed_rooms: Number(form.num_bed_rooms),
        relaxation_amenity_count: Number(form.relaxation_amenity_count),
        security_amenity_count: Number(form.security_amenity_count),
        maintenance_or_cleaning_amenity_count: Number(
          form.maintenance_or_cleaning_amenity_count,
        ),
        social_amenity_count: Number(form.social_amenity_count),
        expendable_amenity_count: Number(form.expendable_amenity_count),
        service_staff_amenity_count: Number(form.service_staff_amenity_count),
        unclassify_amenity_count: Number(form.unclassify_amenity_count),
      };

      const result = await predictPrice(payload);
      onPrediction(result);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Prediction failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition";
  const errorInputClasses =
    "w-full rounded-lg border border-rose-400 bg-rose-50/40 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition";
  const labelClasses =
    "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider";

  // Small helper so each input can flag itself when Quick Paste
  // couldn't populate it cleanly.
  const classesFor = (name) => (fieldErrors[name] ? errorInputClasses : inputClasses);

  return (
    <div>
      <QuickPasteInput onFill={handleQuickFill} />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-8"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-800 pb-2 border-b border-slate-100">
            Property Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {/* Area */}
            <div>
              <label className={labelClasses}>Area (sq ft)</label>
              <input
                type="number"
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="e.g. 1500"
                min="1"
                required
                className={classesFor("area")}
              />
              {fieldErrors.area && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.area}</p>
              )}
            </div>

            {/* Building Type */}
            <div>
              <label className={labelClasses}>Building Type</label>
              <select
                name="building_type"
                value={form.building_type}
                onChange={handleChange}
                className={classesFor("building_type")}
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Building">Building</option>
                <option value="Office">Office</option>
                <option value="Shop">Shop</option>
                <option value="Duplex">Duplex</option>
                <option value="Floor">Floor</option>
                <option value="Residential Plot">Residential Plot</option>
                <option value="Commercial Plot">Commercial Plot</option>
                <option value="Others">Others</option>
              </select>
              {fieldErrors.building_type && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.building_type}
                </p>
              )}
            </div>

            {/* Building Nature */}
            <div>
              <label className={labelClasses}>Building Nature</label>
              <select
                name="building_nature"
                value={form.building_nature}
                onChange={handleChange}
                className={classesFor("building_nature")}
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
              {fieldErrors.building_nature && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.building_nature}
                </p>
              )}
            </div>

            {/* Bedrooms */}
            <div>
              <label className={labelClasses}>Bedrooms</label>
              <input
                type="number"
                name="num_bed_rooms"
                value={form.num_bed_rooms}
                onChange={handleChange}
                min="0"
                required
                className={classesFor("num_bed_rooms")}
              />
              {fieldErrors.num_bed_rooms && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.num_bed_rooms}
                </p>
              )}
            </div>

            {/* Bathrooms */}
            <div>
              <label className={labelClasses}>Bathrooms</label>
              <input
                type="number"
                name="num_bath_rooms"
                value={form.num_bath_rooms}
                onChange={handleChange}
                min="0"
                required
                className={classesFor("num_bath_rooms")}
              />
              {fieldErrors.num_bath_rooms && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.num_bath_rooms}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className={labelClasses}>City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Dhaka"
                required
                className={classesFor("city")}
              />
              {fieldErrors.city && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.city}</p>
              )}
            </div>

            {/* Locality */}
            <div>
              <label className={labelClasses}>Locality</label>
              <input
                type="text"
                name="locality"
                value={form.locality}
                onChange={handleChange}
                placeholder="Dhanmondi"
                required
                className={classesFor("locality")}
              />
              {fieldErrors.locality && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.locality}
                </p>
              )}
            </div>

            {/* Zone */}
            <div>
              <label className={labelClasses}>Zone</label>
              <input
                type="text"
                name="zone"
                value={form.zone}
                onChange={handleChange}
                placeholder="Dhanmondi"
                required
                className={classesFor("zone")}
              />
              {fieldErrors.zone && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.zone}</p>
              )}
            </div>

            {/* Division */}
            <div>
              <label className={labelClasses}>Division</label>
              <input
                type="text"
                name="division"
                value={form.division}
                onChange={handleChange}
                placeholder="Dhaka"
                required
                className={classesFor("division")}
              />
              {fieldErrors.division && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.division}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
            Amenities
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div>
              <label className={labelClasses}>Relaxation Amenities</label>
              <input
                type="number"
                name="relaxation_amenity_count"
                value={form.relaxation_amenity_count}
                onChange={handleChange}
                min="0"
                className={classesFor("relaxation_amenity_count")}
              />
            </div>

            <div>
              <label className={labelClasses}>Security Amenities</label>
              <input
                type="number"
                name="security_amenity_count"
                value={form.security_amenity_count}
                onChange={handleChange}
                min="0"
                className={classesFor("security_amenity_count")}
              />
            </div>

            <div>
              <label className={labelClasses}>Maintenance / Cleaning</label>
              <input
                type="number"
                name="maintenance_or_cleaning_amenity_count"
                value={form.maintenance_or_cleaning_amenity_count}
                onChange={handleChange}
                min="0"
                className={classesFor("maintenance_or_cleaning_amenity_count")}
              />
            </div>

            <div>
              <label className={labelClasses}>Social Amenities</label>
              <input
                type="number"
                name="social_amenity_count"
                value={form.social_amenity_count}
                onChange={handleChange}
                min="0"
                className={classesFor("social_amenity_count")}
              />
            </div>

            <div>
              <label className={labelClasses}>Expendable Amenities</label>
              <input
                type="number"
                name="expendable_amenity_count"
                value={form.expendable_amenity_count}
                onChange={handleChange}
                min="0"
                className={classesFor("expendable_amenity_count")}
              />
            </div>

            <div>
              <label className={labelClasses}>Service Staff Amenities</label>
              <input
                type="number"
                name="service_staff_amenity_count"
                value={form.service_staff_amenity_count}
                onChange={handleChange}
                min="0"
                className={classesFor("service_staff_amenity_count")}
              />
            </div>

            <div>
              <label className={labelClasses}>Unclassified Amenities</label>
              <input
                type="number"
                name="unclassify_amenity_count"
                value={form.unclassify_amenity_count}
                onChange={handleChange}
                min="0"
                className={classesFor("unclassify_amenity_count")}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold shadow-lg shadow-indigo-600/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Predicting...</span>
              </>
            ) : (
              "Predict Sale Price"
            )}
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            disabled={loading}
            className="py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictionForm;
