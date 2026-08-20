// --------------------------------------------------
// Single source of truth for property fields
// --------------------------------------------------
// PredictionForm, QuickPasteInput, and (going forward) the CSV batch
// uploader should all read field order, labels, types, and validation
// rules from here rather than hard-coding their own copies. This keeps
// the three input methods (manual form, quick paste, CSV upload) from
// silently drifting out of sync as the model's feature set changes.
//
// `aliases` lists the header names we'll recognize when a pasted/CSV
// row includes a header line (case/space/underscore-insensitive).

export const PROPERTY_FIELDS = [
  {
    key: "area",
    label: "Area (sq ft)",
    type: "number",
    required: true,
    min: 1,
    default: "",
    aliases: ["area", "area_sqft", "area_sq_ft", "sqft", "sq_ft", "size"],
  },
  {
    key: "building_type",
    label: "Building Type",
    type: "select",
    required: true,
    default: "Apartment",
    options: [
      "Apartment",
      "House",
      "Building",
      "Office",
      "Shop",
      "Duplex",
      "Floor",
      "Residential Plot",
      "Commercial Plot",
      "Others",
    ],
    aliases: ["building_type", "type", "property_type"],
  },
  {
    key: "building_nature",
    label: "Building Nature",
    type: "select",
    required: true,
    default: "Residential",
    options: ["Residential", "Commercial"],
    aliases: ["building_nature", "nature"],
  },
  {
    key: "num_bath_rooms",
    label: "Bathrooms",
    type: "number",
    required: true,
    min: 0,
    default: "",
    aliases: ["num_bath_rooms", "bathrooms", "bath_rooms", "baths"],
  },
  {
    key: "num_bed_rooms",
    label: "Bedrooms",
    type: "number",
    required: true,
    min: 0,
    default: "",
    aliases: ["num_bed_rooms", "bedrooms", "bed_rooms", "beds"],
  },
  {
    key: "city",
    label: "City",
    type: "text",
    required: true,
    default: "Dhaka",
    aliases: ["city"],
  },
  {
    key: "locality",
    label: "Locality",
    type: "text",
    required: true,
    default: "",
    aliases: ["locality", "area_name", "neighbourhood", "neighborhood"],
  },
  {
    key: "zone",
    label: "Zone",
    type: "text",
    required: true,
    default: "",
    aliases: ["zone"],
  },
  {
    key: "division",
    label: "Division",
    type: "text",
    required: true,
    default: "",
    aliases: ["division"],
  },
  {
    key: "relaxation_amenity_count",
    label: "Relaxation Amenities",
    type: "number",
    required: false,
    min: 0,
    default: 0,
    aliases: ["relaxation_amenity_count", "relaxation_amenities"],
  },
  {
    key: "security_amenity_count",
    label: "Security Amenities",
    type: "number",
    required: false,
    min: 0,
    default: 0,
    aliases: ["security_amenity_count", "security_amenities"],
  },
  {
    key: "maintenance_or_cleaning_amenity_count",
    label: "Maintenance / Cleaning",
    type: "number",
    required: false,
    min: 0,
    default: 0,
    aliases: [
      "maintenance_or_cleaning_amenity_count",
      "maintenance_amenities",
      "cleaning_amenities",
    ],
  },
  {
    key: "social_amenity_count",
    label: "Social Amenities",
    type: "number",
    required: false,
    min: 0,
    default: 0,
    aliases: ["social_amenity_count", "social_amenities"],
  },
  {
    key: "expendable_amenity_count",
    label: "Expendable Amenities",
    type: "number",
    required: false,
    min: 0,
    default: 0,
    aliases: ["expendable_amenity_count", "expendable_amenities"],
  },
  {
    key: "service_staff_amenity_count",
    label: "Service Staff Amenities",
    type: "number",
    required: false,
    min: 0,
    default: 0,
    aliases: ["service_staff_amenity_count", "service_staff_amenities"],
  },
  {
    key: "unclassify_amenity_count",
    label: "Unclassified Amenities",
    type: "number",
    required: false,
    min: 0,
    default: 0,
    aliases: ["unclassify_amenity_count", "unclassified_amenities"],
  },
];

// Positional fallback order — used when a pasted/uploaded row has no
// recognizable header line.
export const FIELD_ORDER = PROPERTY_FIELDS.map((field) => field.key);

// --------------------------------------------------
// Internal/export feature order
// --------------------------------------------------
// The upstream data source (the internal export used for model
// training) emits rows in a different, longer column order than the
// form: it interleaves the raw form fields with derived/computed
// features (log_area, total_rooms, etc.) and repeats a couple of the
// location fields further down the row. When a pasted/uploaded row
// has no header and doesn't match FIELD_ORDER's length, we fall back
// to this order instead.
//
// Entries prefixed with "__derived_" are computed columns that don't
// correspond to an editable form field — parsePastedRow strips them
// rather than mapping them. "__unknown_1" is a real column we haven't
// identified yet (always observed as 0 so far); it's stripped too
// until we know what it represents.
export const INTERNAL_FEATURE_ORDER = [
  "area",
  "building_type",
  "building_nature",
  "num_bath_rooms",
  "num_bed_rooms",
  "city",
  "locality",
  "relaxation_amenity_count",
  "security_amenity_count",
  "maintenance_or_cleaning_amenity_count",
  "social_amenity_count",
  "expendable_amenity_count",
  "service_staff_amenity_count",
  "unclassify_amenity_count",
  "division",
  "zone",
  "__unknown_1",
  "__derived_log_area",
  "__derived_total_rooms",
  "__derived_bath_bed_ratio",
  "__derived_area_per_bedroom",
  "__derived_total_amenity_count",
];

export const isDerivedOrUnknownKey = (key) =>
  key.startsWith("__derived_") || key.startsWith("__unknown");

export const FIELD_MAP = Object.fromEntries(
  PROPERTY_FIELDS.map((field) => [field.key, field]),
);

const normalizeHeader = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, "_")
    .replace(/["']/g, "");

export const findFieldByHeader = (header) => {
  const normalized = normalizeHeader(header);
  return PROPERTY_FIELDS.find((field) =>
    field.aliases.some((alias) => normalizeHeader(alias) === normalized),
  );
};

// Handy default-value map, e.g. for resetting the form.
export const DEFAULT_PROPERTY_VALUES = Object.fromEntries(
  PROPERTY_FIELDS.map((field) => [field.key, field.default]),
);
