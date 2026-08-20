from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.prediction import router as prediction_router
from api.routes.model import router as model_router

app = FastAPI(
    title="Bangladesh Real Estate Price Prediction API",
    description='API for predicting Bangladesh real estate sale prices using XGBoost',
    version='1.0.0',
)

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=['https://bangladesh-real-estate-price-predic.vercel.app/'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(prediction_router)

app.include_router(model_router)

# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get('/')
def root():
    return {
        'message': 'Bangladesh Real Estate Price Prediction API',
        'status': 'running',
    }

@app.get('/health')
def health_check():
    return {
        'status': 'healthy'
    }