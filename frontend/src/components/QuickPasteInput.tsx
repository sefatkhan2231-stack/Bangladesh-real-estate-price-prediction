import { useState } from "react";
import { FIELD_MAP } from "../config/propertyFields";
import { parsePastedRow } from "../utils/parsePastedRow";

const PLACEHOLDER = `area,building_type,building_nature,num_bath_rooms,num_bed_rooms,city,locality,zone,division
1200,Apartment,Residential,2,3,Dhaka,Gulshan,Gulshan,Dhaka`;

// Paste a CSV row, a tab-separated row copied from Excel, or a row with
// a header line above it. Parses it and hands the resulting values up
// to PredictionForm, which merges them into its existing form state —
// this component never holds prediction data itself and never talks to
// the API directly.
const QuickPasteInput = ({ onFill }) => {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);

  const handleAutoFill = () => {
    if (!raw.trim()) {
      setResult({
        success: false,
        values: {},
        errors: [{ field: null, message: "Paste a CSV or Excel row first." }],
        missing: [],
        filledCount: 0,
        usedHeaders: false,
        usedInternalOrder: false,
      });
      return;
    }

    const parsed = parsePastedRow(raw);
    setResult(parsed);

    if (Object.keys(parsed.values).length > 0) {
      onFill(parsed.values, parsed.errors);
    }
  };

  const handleClear = () => {
    setRaw("");
    setResult(null);
  };

  const inputClasses =
    "mt-4 w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 font-mono shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-y";

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 mb-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Quick Paste Row</h2>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          CSV / Excel row
        </span>
      </div>

      <p className="text-sm text-slate-500 mt-3">
        Copy a row from a spreadsheet — with or without its header — and paste
        it below to auto-fill the form. You can still review and edit every
        field before predicting.
      </p>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={3}
        spellCheck={false}
        className={inputClasses}
      />

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          type="button"
          onClick={handleAutoFill}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          Auto Fill Form
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition cursor-pointer"
        >
          Clear Input
        </button>
      </div>

      {result && (
        <div className="mt-4 space-y-2 text-sm">
          {result.filledCount > 0 && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <span>✓</span>
              <span>
                Row parsed
                {result.usedHeaders
                  ? " using the header row"
                  : result.usedInternalOrder
                    ? " using the internal export column order"
                    : " using the default field order"}{" "}
                — {result.filledCount} field
                {result.filledCount !== 1 ? "s" : ""} populated
              </span>
            </div>
          )}

          {result.missing.length > 0 && (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span>⚠</span>
              <span>
                Missing value{result.missing.length !== 1 ? "s" : ""}:{" "}
                {result.missing
                  .map((key) => FIELD_MAP[key]?.label || key)
                  .join(", ")}
              </span>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="flex items-start gap-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <span>✕</span>
              <div className="space-y-0.5">
                {result.errors.map((err, i) => (
                  <div key={i}>{err.message}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickPasteInput;
