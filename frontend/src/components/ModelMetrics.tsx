import { useEffect, useState } from "react";
import { getModelInfo } from "../api/api";

const ModelMetrics = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const data = await getModelInfo();
        setModelInfo(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load model information.");
      } finally {
        setLoading(false);
      }
    };

    fetchModelInfo();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center text-slate-500">
        <p className="animate-pulse">Loading model performance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-center text-sm font-medium">
        {error}
      </div>
    );
  }

  if (!modelInfo) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-800 pb-2 border-b border-slate-100 mb-6">
        Model Performance Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 text-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            R² Score
          </h3>
          <p className="text-3xl font-extrabold text-slate-800">
            {modelInfo.test_metrics.Log_R2?.toFixed(4) * 100}%
          </p>
        </div>

        <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-5 text-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
            RMSE
          </h3>
          <p className="text-3xl font-extrabold text-slate-800">
            {modelInfo.test_metrics.Log_RMSE?.toFixed(5)}
          </p>
        </div>

        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-5 text-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">
            MAE
          </h3>
          <p className="text-3xl font-extrabold text-slate-800">
            {modelInfo.test_metrics.Log_MAE?.toFixed(5)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ModelMetrics;
