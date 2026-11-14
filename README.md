# 🏠 Bangladesh Real Estate Price Prediction

An end-to-end machine learning web application that predicts real estate sale prices in Bangladesh using an **XGBoost** regression model. The project includes a **FastAPI** backend for serving predictions and model insights, and a **React (Vite + TypeScript)** frontend for interacting with the model — including single predictions, CSV batch predictions, and model explainability (SHAP) visualizations.

---

## ✨ Features

- **Single Property Prediction** — Fill out a form (or quick-paste a spreadsheet row) to get an instant predicted sale price.
- **Quick Paste Input** — Paste a CSV/Excel row (with or without headers) and auto-fill the prediction form.
- **Batch Prediction (CSV Upload)** — Upload a CSV of multiple properties and get predictions for every row, with per-row validation and downloadable results.
- **Model Performance Dashboard** — View R², RMSE, and MAE metrics for the trained model.
- **Feature Importance & SHAP Explainability** — Visualize which features most influence predictions.
- **Model Comparison** — Compare baseline vs. tuned model performance side-by-side.

---

## 🧱 Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — REST API framework
- [XGBoost](https://xgboost.readthedocs.io/) — gradient-boosted trees for price prediction
- [scikit-learn](https://scikit-learn.org/) — preprocessing pipeline
- [SHAP](https://shap.readthedocs.io/) — model explainability
- [pandas](https://pandas.pydata.org/) / [joblib](https://joblib.readthedocs.io/)

**Frontend**
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Recharts](https://recharts.org/) — charts and data visualization
- [Axios](https://axios-http.com/) — API client

---

## 📂 Project Structure

```
├── backend/
│   ├── api/
│   │   └── routes/
│   │       ├── prediction.py      # /api/predict, /api/predict/batch
│   │       └── model.py           # /api/model/* (metrics, importance, SHAP)
│   ├── schemas/                   # Pydantic request/response models
│   ├── services/
│   │   └── prediction_service.py  # Loads model, runs predictions
│   ├── models/
│   │   └── real_estate_price_model.joblib
│   ├── generate_shap.py           # Script to compute & export SHAP values
│   └── main.py                    # FastAPI app entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js             # Axios API wrapper
│   │   ├── config/
│   │   │   └── propertyFields.js  # Single source of truth for form fields
│   │   ├── utils/
│   │   │   └── parsePastedRow.js  # Quick-paste CSV/Excel row parser
│   │   ├── components/
│   │   │   ├── PredictionForm.tsx
│   │   │   ├── PredictionResult.tsx
│   │   │   ├── QuickPasteInput.tsx
│   │   │   ├── BatchPrediction.tsx
│   │   │   ├── ModelMetrics.tsx
│   │   │   ├── FeatureImportance.tsx
│   │   │   ├── ShapImportance.tsx
│   │   │   └── ModelComparison.tsx
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   └── App.tsx
│   └── package.json
│
└── reports/
    ├── model_metadata.json
    ├── feature_importance.csv
    ├── shap_feature_importance.csv
    ├── model_comparison.csv
    └── result_log.json
```

> Folder names above are illustrative — adjust to match your actual repo layout.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A trained model file (`real_estate_price_model.joblib`) and generated reports (metadata, feature importance, SHAP values, comparison)

### 1. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.
Interactive API docs: `http://127.0.0.1:8000/docs`

### 2. Generate SHAP Feature Importance (optional, if not already generated)

```bash
python generate_shap.py
```

This reads the trained model and dataset, computes SHAP values, and writes `shap_feature_importance.csv` to the `reports/` directory.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create a .env file
echo "VITE_API_URL=http://127.0.0.1:8000" > .env

# Run the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Prediction

| Method | Endpoint             | Description                                  |
|--------|-----------------------|-----------------------------------------------|
| POST   | `/api/predict`         | Predict the sale price for a single property |
| POST   | `/api/predict/batch`   | Upload a CSV and predict prices for all rows  |

### Model Insights

| Method | Endpoint                     | Description                          |
|--------|-------------------------------|----------------------------------------|
| GET    | `/api/model/info`             | Model metadata & test metrics         |
| GET    | `/api/model/feature-importance` | Feature importance data             |
| GET    | `/api/model/shap`             | SHAP-based feature importance         |
| GET    | `/api/model/comparison`       | Baseline vs. tuned model comparison   |
| GET    | `/api/model/results`          | Training results log                  |

### Health Check

| Method | Endpoint  | Description       |
|--------|-----------|--------------------|
| GET    | `/`        | API status message |
| GET    | `/health`  | Health check        |

---

## 📄 CSV Batch Prediction Format

The uploaded CSV must include the following required columns:

```
area, building_type, building_nature, num_bath_rooms, num_bed_rooms,
city, locality, zone, division
```

Optional amenity columns (default to `0` if omitted):

```
relaxation_amenity_count, security_amenity_count,
maintenance_or_cleaning_amenity_count, social_amenity_count,
expendable_amenity_count, service_staff_amenity_count,
unclassify_amenity_count
```

Maximum of **5,000 rows** per upload. Rows that fail validation are reported individually without blocking the rest of the batch.

---

## 🧠 Model Details

- **Algorithm:** XGBoost Regressor (trained on log-transformed sale price)
- **Preprocessing:** scikit-learn `ColumnTransformer` pipeline (numeric scaling + categorical encoding)
- **Explainability:** SHAP `TreeExplainer` for global feature importance
- **Evaluation Metrics:** R², RMSE, MAE (both log-scale and raw-price scale)

---

## 🌐 Deployment

- **Frontend:** Deployed on [Vercel](https://vercel.com/)
- **Backend:** CORS is configured for local development (`http://localhost:5173`) and the production frontend URL — update `main.py` with your deployed frontend origin.

---

## 🛠️ Environment Variables

**Frontend (`.env`)**
```
VITE_API_URL=http://127.0.0.1:8000
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a pull request or file an issue.
