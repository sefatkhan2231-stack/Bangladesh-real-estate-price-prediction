import {
  FIELD_ORDER,
  findFieldByHeader,
  INTERNAL_FEATURE_ORDER,
  isDerivedOrUnknownKey,
  PROPERTY_FIELDS,
} from "../config/propertyFields";

// --------------------------------------------------
// Delimiter detection
// --------------------------------------------------
// Excel-copied rows are tab-separated; CSV rows are comma-separated.
// If a line contains a tab, prefer that — commas can legitimately
// appear inside quoted CSV values, but a literal tab almost never
// shows up in a pasted CSV row.

const detectDelimiter = (line) => (line.includes("\t") ? "\t" : ",");

// --------------------------------------------------
// Delimited line splitter
// --------------------------------------------------
// Handles quoted values (so commas/tabs inside quotes don't split the
// row) and escaped double-quotes ("").

const splitDelimitedLine = (line, delimiter) => {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
};

// --------------------------------------------------
// Main parser
// --------------------------------------------------
// Returns:
//   success      - true only if every required field parsed cleanly
//   values       - map of field key -> converted, validated value
//                  (only fields that parsed successfully are included)
//   errors       - [{ field, message }] for values that couldn't be
//                  mapped/converted (these are NOT included in `values`
//                  so they never overwrite a good value)
//   missing      - required field keys that had no value at all
//   filledCount  - number of fields successfully populated
//   usedHeaders  - whether header-based mapping was used
//   usedInternalOrder - whether the row was mapped positionally using
//                  INTERNAL_FEATURE_ORDER (the longer internal-export
//                  column order) instead of the form's FIELD_ORDER

export const parsePastedRow = (rawInput) => {
  const lines = rawInput
    .split(/\r?\n/)
    .map((line) => line)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      values: {},
      errors: [{ field: null, message: "Paste a CSV or Excel row first." }],
      missing: [],
      filledCount: 0,
      usedHeaders: false,
      usedInternalOrder: false,
    };
  }

  const delimiter = detectDelimiter(lines[0]);

  let headerCells = null;
  let dataCells;

  if (lines.length >= 2) {
    const firstLineCells = splitDelimitedLine(lines[0], delimiter);
    const recognizedCount = firstLineCells.filter((cell) =>
      findFieldByHeader(cell),
    ).length;

    // Treat the first line as a header row if at least half its cells
    // match a known field alias.
    if (recognizedCount >= Math.ceil(firstLineCells.length / 2)) {
      headerCells = firstLineCells;
      dataCells = splitDelimitedLine(lines[1], delimiter);
    } else {
      dataCells = firstLineCells;
    }
  } else {
    dataCells = splitDelimitedLine(lines[0], delimiter);
  }

  // Map raw string values onto field keys.
  const rawValues = {};
  let usedInternalOrder = false;

  if (headerCells) {
    headerCells.forEach((headerCell, index) => {
      const field = findFieldByHeader(headerCell);
      if (field && dataCells[index] !== undefined) {
        rawValues[field.key] = dataCells[index];
      }
    });
  } else {
    // No usable header. A headerless row can come from two different
    // places: a form-shaped paste (FIELD_ORDER, 16 columns) or the
    // internal data export, which emits a longer row that interleaves
    // derived/computed columns and repeats a couple of location
    // fields (INTERNAL_FEATURE_ORDER). Pick whichever order the cell
    // count actually matches, preferring the shorter/simpler form
    // order on a tie or when the row doesn't cleanly match either.
    usedInternalOrder =
      dataCells.length > FIELD_ORDER.length &&
      dataCells.length <= INTERNAL_FEATURE_ORDER.length;

    const positionalOrder = usedInternalOrder
      ? INTERNAL_FEATURE_ORDER
      : FIELD_ORDER;

    positionalOrder.forEach((key, index) => {
      if (index < dataCells.length && !isDerivedOrUnknownKey(key)) {
        rawValues[key] = dataCells[index];
      }
    });
  }

  const values = {};
  const errors = [];
  const missing = [];

  PROPERTY_FIELDS.forEach((field) => {
    const raw = rawValues[field.key];
    const isEmpty =
      raw === undefined || raw === null || String(raw).trim() === "";

    if (isEmpty) {
      if (field.required) {
        missing.push(field.key);
      }
      // Optional fields silently fall back to their default elsewhere;
      // we don't add them to `values` so we never stomp a value the
      // user may have already entered manually.
      return;
    }

    // Strip a wrapping pair of quotes left over from quoted CSV cells,
    // and any stray whitespace.
    const cleaned = String(raw)
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .trim();

    if (field.type === "number") {
      const num = Number(cleaned);
      if (Number.isNaN(num) || (field.min !== undefined && num < field.min)) {
        errors.push({
          field: field.key,
          message: `Couldn't read "${cleaned}" as a valid ${field.label}.`,
        });
      } else {
        values[field.key] = num;
      }
    } else if (field.type === "select") {
      const match = field.options.find(
        (option) => option.toLowerCase() === cleaned.toLowerCase(),
      );
      if (!match) {
        errors.push({
          field: field.key,
          message: `"${cleaned}" isn't a recognized ${field.label}.`,
        });
      } else {
        values[field.key] = match;
      }
    } else {
      values[field.key] = cleaned;
    }
  });

  return {
    success: errors.length === 0 && missing.length === 0,
    values,
    errors,
    missing,
    filledCount: Object.keys(values).length,
    usedHeaders: Boolean(headerCells),
    usedInternalOrder,
  };
};
