import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictPrice = async (propertyData) => {
  const response = await api.post("/predict", propertyData);

  return response.data;
};

export const predictBatch = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/predict/batch", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getModelInfo = async () => {
  const response = await api.get("/model/info");

  return response.data;
};

export const getFeatureImportance = async () => {
  const response = await api.get("/model/feature-importance");

  return response.data;
};

export const getModelComparison = async () => {
  const response = await api.get("/model/comparison");

  return response.data;
};

export const getShapImportance = async () => {
  const response = await api.get("/model/shap");

  return response.data;
};

export default api;
