import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getFeatureImportance } from "../api/api";

const FeatureImportance = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeatureImportance = async () => {
      try {
        const data = await getFeatureImportance();

        const formattedData = (data.features || [])
          .map((item) => ({
            feature: item.feature,
            importance: Number(item.mean_abs_shap),
          }))
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 10);

        setFeatures(formattedData);
      } catch (err) {
        console.error(err);
        setError("Unable to load feature importance.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureImportance();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center text-slate-500">
        <p className="animate-pulse">Loading feature importance...</p>
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
    <section className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Top 10 Feature Importance
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          These features have the greatest SHAP impact on the model's
          predictions.
        </p>
      </div>

      <div className="w-full h-[400px] bg-slate-50 rounded-xl p-4 border border-slate-100">
        <ResponsiveContainer>
          <BarChart
            data={features}
            layout="vertical"
            margin={{
              top: 10,
              right: 30,
              left: 30,
              bottom: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#E2E8F0"
            />
            <XAxis type="number" tick={{ fill: "#64748B", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="feature"
              width={120}
              tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                borderRadius: "8px",
                color: "#FFF",
                border: "none",
              }}
            />
            <Bar dataKey="importance" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default FeatureImportance;
