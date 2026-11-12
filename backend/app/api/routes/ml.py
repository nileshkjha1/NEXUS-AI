import os
import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_current_active_user, require_roles
from app.models.user import User, UserRole
from app.ml.predict import get_model_manager
from app.ml.train import train_models, DEFAULT_METRICS_PATH

router = APIRouter(prefix="/ml", tags=["Machine Learning Engine"])


class TextPayload(BaseModel):
    text: str = Field(..., min_length=3, description="Incident title or description text")


class TriagePayload(BaseModel):
    title: str = Field(..., min_length=3, description="Incident title")
    description: str = Field(..., min_length=5, description="Incident description")


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: Dict[str, float]


class TriageResponse(BaseModel):
    predicted_category: str
    category_confidence: float
    category_probabilities: Dict[str, float]
    predicted_priority: str
    priority_confidence: float
    priority_probabilities: Dict[str, float]


@router.post("/predict-category", response_model=PredictionResponse)
def predict_category(
    payload: TextPayload,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Predict the IT incident category from text using trained TF-IDF + Logistic Regression model.
    """
    manager = get_model_manager()
    res = manager.predict_category(payload.text)
    return {
        "prediction": res["predicted_category"],
        "confidence": res["confidence"],
        "probabilities": res["probabilities"],
    }


@router.post("/predict-priority", response_model=PredictionResponse)
def predict_priority(
    payload: TextPayload,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Predict the incident priority/urgency (Low, Medium, High, Critical) from text.
    """
    manager = get_model_manager()
    res = manager.predict_priority(payload.text)
    return {
        "prediction": res["predicted_priority"],
        "confidence": res["confidence"],
        "probabilities": res["probabilities"],
    }


@router.post("/triage", response_model=TriageResponse)
def triage_incident(
    payload: TriagePayload,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Perform simultaneous multi-task triage predicting both Category and Priority with confidence scores.
    """
    manager = get_model_manager()
    res = manager.triage(payload.title, payload.description)
    return {
        "predicted_category": res["category"],
        "category_confidence": res["category_confidence"],
        "category_probabilities": res["category_probabilities"],
        "predicted_priority": res["priority"],
        "priority_confidence": res["priority_confidence"],
        "priority_probabilities": res["priority_probabilities"],
    }


@router.get("/metrics")
def get_model_metrics(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve real evaluation metrics (Accuracy, F1-score, Precision, Recall, Confusion Matrix).
    """
    if not os.path.exists(DEFAULT_METRICS_PATH):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics file not found. Please train models first.",
        )
    with open(DEFAULT_METRICS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/retrain")
def retrain_models_endpoint(
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
) -> Any:
    """
    Trigger full ML model retraining and evaluation (Administrator only).
    """
    try:
        metrics = train_models()
        # Reload models in singleton manager
        get_model_manager().load_models()
        return {
            "message": "Models successfully retrained and reloaded.",
            "metrics": metrics,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retraining failed: {str(e)}",
        )

