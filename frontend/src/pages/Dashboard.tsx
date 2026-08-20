import { useState } from "react";

import BatchPrediction from "../components/BatchPrediction";
import FeatureImportance from "../components/FeatureImportance";
import ModelComparison from "../components/ModelComparison";
import ModelMetrics from "../components/ModelMetrics";
import PredictionForm from "../components/PredictionForm";
import PredictionResult from "../components/PredictionResult";
import ShapImportance from "../components/ShapImportance";

const Dashboard = () => {
  const [prediction, setPrediction] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-teal-300 bg-clip-text text-transparent">
            Bangladesh Real Estate Price Prediction
          </h1>
          <p className="mt-2 text-slate-400 text-sm md:text-base">
            AI-powered property sale price valuation using gradient-boosted
            decision trees (XGBoost)
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <PredictionForm onPrediction={setPrediction} />
          </div>

          <div className="lg:col-span-1 sticky top-8">
            {prediction ? (
              <PredictionResult prediction={prediction} />
            ) : (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center flex flex-col justify-center items-center h-full min-h-[250px]">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                  🏷️
                </div>
                <h3 className="text-slate-700 font-semibold mb-1">
                  Ready for Valuation
                </h3>
                <p className="text-slate-400 text-xs max-w-xs">
                  Fill out the property details and submit the form to view the
                  estimated sale price.
                </p>
              </div>
            )}
          </div>
        </section>

        <BatchPrediction />

        <ModelMetrics />

        <FeatureImportance />

        <ShapImportance />

        <ModelComparison />
      </main>
    </div>
  );
};

export default Dashboard;
