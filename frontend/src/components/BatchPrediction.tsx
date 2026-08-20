import { useRef, useState } from "react";
import { predictBatch } from "../api/api";

// --------------------------------------------------
// CSV helpers (client-side, used only for the two
// downloadable results files)
// --------------------------------------------------

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const buildCsv = (rows, columns) => {
  const header = columns.map(escapeCsvValue).join(",");
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvValue(row[col])).join(","),
  );
  return [header, ...lines].join("\n");
};

const downloadCsv = (content, filename) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatBDT = (value) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);

const PREVIEW_ROW_LIMIT = 20;
const PREVIEW_COLUMN_LIMIT = 6;

const BatchPrediction = () => {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    summary: { total_rows: number; successful: number; failed: number };
    results: Array<{
      row_index: number;
      success: boolean;
      data: Record<string, unknown>;
      predicted_price?: number;
      error?: string;
    }>;
  } | null>(null);

  const inputColumns = result?.results?.length
    ? Object.keys(result.results[0].data)
    : [];

  const resetSelection = () => {
    setFile(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (selected) => {
    setError("");
    setResult(null);

    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a file with a .csv extension.");
      return;
    }

    if (selected.size === 0) {
      setError("That file is empty.");
      return;
    }

    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictBatch(file);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Batch prediction failed. Please check your file and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadInputAndPredictions = () => {
    if (!result) return;

    const columns = [...inputColumns, "predicted_price", "error"];
    const rows = result.results.map((row) => ({
      ...row.data,
      predicted_price: row.success ? row.predicted_price : "",
      error: row.success ? "" : row.error,
    }));

    downloadCsv(buildCsv(rows, columns), "input_and_predictions.csv");
  };

  const downloadPredictionsOnly = () => {
    if (!result) return;

    const hasIdColumn = inputColumns.includes("id");
    const columns = ["id", "predicted_price"];
    const rows = result.results
      .filter((row) => row.success)
      .map((row) => ({
        id: hasIdColumn ? row.data.id : row.row_index + 1,
        predicted_price: row.predicted_price,
      }));

    downloadCsv(buildCsv(rows, columns), "predictions_only.csv");
  };

  return (
    <section className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 pb-2 border-b border-slate-100">
          Batch Prediction (CSV)
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Upload a CSV with multiple properties to generate a predicted sale
          price for every row in one pass.
        </p>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
        <div className="text-3xl mb-2">📄</div>
        <p className="text-sm font-medium text-slate-700">
          Click to browse or drag &amp; drop a CSV file here
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Only .csv files are accepted
        </p>
      </div>

      {file && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div>
            <p className="font-semibold text-slate-700">{file.name}</p>
            <p className="text-slate-400 text-xs">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={resetSelection}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold shadow-lg shadow-indigo-600/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
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
            <span>Validating &amp; predicting...</span>
          </>
        ) : (
          "Run Batch Prediction"
        )}
      </button>

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
              <p className="text-2xl font-extrabold text-slate-800">
                {result.summary.total_rows}
              </p>
              <p className="text-xs uppercase tracking-wider text-slate-400 mt-1">
                Total Rows
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-700">
                {result.summary.successful}
              </p>
              <p className="text-xs uppercase tracking-wider text-emerald-500 mt-1">
                Successful
              </p>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-center">
              <p className="text-2xl font-extrabold text-rose-700">
                {result.summary.failed}
              </p>
              <p className="text-xs uppercase tracking-wider text-rose-400 mt-1">
                Failed
              </p>
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={downloadInputAndPredictions}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition cursor-pointer"
            >
              ⬇ Download Input + Predictions CSV
            </button>
            <button
              type="button"
              onClick={downloadPredictionsOnly}
              disabled={result.summary.successful === 0}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ⬇ Download Predictions Only CSV
            </button>
          </div>

          {/* Results preview */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 text-left">Row</th>
                  {inputColumns.slice(0, PREVIEW_COLUMN_LIMIT).map((col) => (
                    <th key={col} className="px-3 py-2 text-left">
                      {col}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left">Predicted Price</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.results.slice(0, PREVIEW_ROW_LIMIT).map((row) => (
                  <tr
                    key={row.row_index}
                    className={row.success ? "" : "bg-rose-50/50"}
                  >
                    <td className="px-3 py-2 text-slate-500">
                      {row.row_index + 1}
                    </td>
                    {inputColumns.slice(0, PREVIEW_COLUMN_LIMIT).map((col) => (
                      <td key={col} className="px-3 py-2 text-slate-700">
                        {String(row.data[col] ?? "")}
                      </td>
                    ))}
                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {row.success ? formatBDT(row.predicted_price) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {row.success ? (
                        <span className="text-emerald-600 font-medium">
                          Success
                        </span>
                      ) : (
                        <span
                          className="text-rose-600 font-medium cursor-help"
                          title={row.error}
                        >
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.results.length > PREVIEW_ROW_LIMIT && (
            <p className="text-xs text-slate-400 text-center">
              Showing first {PREVIEW_ROW_LIMIT} of {result.results.length} rows.
              Download the CSV for the full results.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default BatchPrediction;
