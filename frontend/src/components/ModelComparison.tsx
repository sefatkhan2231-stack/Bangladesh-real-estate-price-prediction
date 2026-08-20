import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getModelComparison } from "../api/api";

const ModelComparison = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const data = await getModelComparison();

        const formattedData = (data.models || []).map((item) => ({
          model: item.Model,
          logRMSE: Number(item.Test_Log_RMSE),
          logR2: Number(item.Test_Log_R2),
          mae: Number(item.Test_MAE),
          rmse: Number(item.Test_RMSE),
          r2: Number(item.Test_R2),
        }));

        setModels(formattedData);
      } catch (err) {
        console.error(err);
        setError("Unable to load model comparison.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center text-slate-500">
        <p className="animate-pulse">Loading model comparison...</p>
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

  return (
    <section className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Model Comparison</h2>
        <p className="text-sm text-slate-500 mt-1">
          Performance comparison between the baseline and tuned XGBoost models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Log R² */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">
            Log-Scale R²
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={models}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="model"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "8px",
                    color: "#FFF",
                    border: "none",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="logR2"
                  name="Log R²"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Log RMSE */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">
            Log-Scale RMSE
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={models}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="model"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "8px",
                    color: "#FFF",
                    border: "none",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="logRMSE"
                  name="Log RMSE"
                  fill="#0EA5E9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Raw R² */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">
            Raw-Price R²
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={models}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="model"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "8px",
                    color: "#FFF",
                    border: "none",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="r2"
                  name="R²"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelComparison;
