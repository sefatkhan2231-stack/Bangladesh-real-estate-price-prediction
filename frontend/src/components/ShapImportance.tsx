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
import { getShapImportance } from "../api/api";

const ShapImportance = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchShap = async () => {
      try {
        const data = await getShapImportance();

        // Reverse after descending sort so highest value appears at the top of the Y-Axis
        const topFeatures = (data?.features || [])
          .map((item) => ({
            feature: item.feature,
            importance: Number(item.mean_abs_shap) || 0,
          }))
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 15)
          .reverse();

        if (isMounted) {
          setFeatures(topFeatures);
        }
      } catch (err) {
        if (isMounted) {
          console.error("SHAP Load Error:", err);
          setError("Unable to load SHAP feature importance.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchShap();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center text-slate-500">
        <p className="animate-pulse font-medium">Loading SHAP explanation...</p>
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

  if (!features.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 font-medium">
        No feature importance data available.
      </div>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          SHAP Feature Importance
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Top features contributing to the model's overall prediction outputs.
        </p>
      </div>

      <div className="w-full h-[550px] bg-slate-50 rounded-xl p-4 border border-slate-100">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={features}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#E2E8F0"
            />
            <XAxis
              type="number"
              tickFormatter={(val) => val.toFixed(3)}
              tick={{ fill: "#64748B", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={200}
              interval={0}
              tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                borderRadius: "8px",
                color: "#FFF",
                border: "none",
                fontSize: "12px",
              }}
              formatter={(value) => [
                Number(value).toFixed(4),
                "Mean |SHAP Value|",
              ]}
            />
            <Bar
              dataKey="importance"
              name="Mean |SHAP Value|"
              fill="#3B82F6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default ShapImportance;
