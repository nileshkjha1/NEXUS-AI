import os
from typing import Dict, Any, Optional
import joblib
from app.ml.preprocessing import clean_text

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
CATEGORY_MODEL_PATH = os.path.join(MODEL_DIR, "category_model.joblib")
PRIORITY_MODEL_PATH = os.path.join(MODEL_DIR, "priority_model.joblib")


class MLModelManager:
    _instance = None

    def __init__(self):
        self.category_model = None
        self.priority_model = None
        self.load_models()

    @classmethod
    def get_instance(cls) -> "MLModelManager":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self):
        """
        Load persisted models from disk if they exist.
        """
        if os.path.exists(CATEGORY_MODEL_PATH):
            try:
                self.category_model = joblib.load(CATEGORY_MODEL_PATH)
            except Exception as e:
                print(f"Warning: Failed to load category model: {e}")

        if os.path.exists(PRIORITY_MODEL_PATH):
            try:
                self.priority_model = joblib.load(PRIORITY_MODEL_PATH)
            except Exception as e:
                print(f"Warning: Failed to load priority model: {e}")

    def predict_category(self, text: str) -> Dict[str, Any]:
        """
        Predict incident category and return probability distribution.
        """
        clean = clean_text(text)
        if not clean or self.category_model is None:
            return {
                "predicted_category": "Other",
                "confidence": 0.50,
                "probabilities": {"Other": 1.0},
            }

        probs = self.category_model.predict_proba([clean])[0]
        classes = self.category_model.classes_

        prob_dict = {str(c): round(float(p), 4) for c, p in zip(classes, probs)}
        best_class = str(classes[probs.argmax()])
        confidence = round(float(probs.max()), 4)

        return {
            "predicted_category": best_class,
            "confidence": confidence,
            "probabilities": prob_dict,
        }

    def predict_priority(self, text: str) -> Dict[str, Any]:
        """
        Predict incident priority and return probability distribution.
        """
        clean = clean_text(text)
        if not clean or self.priority_model is None:
            return {
                "predicted_priority": "Medium",
                "confidence": 0.50,
                "probabilities": {"Medium": 1.0},
            }

        probs = self.priority_model.predict_proba([clean])[0]
        classes = self.priority_model.classes_

        prob_dict = {str(c): round(float(p), 4) for c, p in zip(classes, probs)}
        best_class = str(classes[probs.argmax()])
        confidence = round(float(probs.max()), 4)

        return {
            "predicted_priority": best_class,
            "confidence": confidence,
            "probabilities": prob_dict,
        }

    def triage(self, title: str, description: str) -> Dict[str, Any]:
        """
        Perform joint triage predicting both Category and Priority.
        """
        full_text = f"{title} {description}"
        cat_result = self.predict_category(full_text)
        pri_result = self.predict_priority(full_text)

        return {
            "category": cat_result["predicted_category"],
            "category_confidence": cat_result["confidence"],
            "category_probabilities": cat_result["probabilities"],
            "priority": pri_result["predicted_priority"],
            "priority_confidence": pri_result["confidence"],
            "priority_probabilities": pri_result["probabilities"],
        }


def get_model_manager() -> MLModelManager:
    return MLModelManager.get_instance()
