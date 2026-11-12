import os
import json
from datetime import datetime, timezone
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)

from app.ml.preprocessing import clean_text

# Resolve paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DEFAULT_DATA_PATH = os.path.join(BASE_DIR, "data", "raw", "incidents.csv")
DEFAULT_METRICS_PATH = os.path.join(BASE_DIR, "data", "processed", "model_metrics.json")
DEFAULT_MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")


def load_dataset(csv_path: str) -> pd.DataFrame:
    """
    Load raw incident dataset and prepare feature text.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)
    # Combine title and description
    df["title"] = df["title"].fillna("")
    df["description"] = df["description"].fillna("")
    df["raw_text"] = df["title"] + " " + df["description"]
    df["clean_text"] = df["raw_text"].apply(clean_text)
    return df


def build_pipeline() -> Pipeline:
    """
    Build a standard TF-IDF + Logistic Regression classification pipeline.
    """
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=2500,
            sublinear_tf=True,
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            solver="lbfgs",
            class_weight="balanced",
            random_state=42,
        )),
    ])


def evaluate_model(pipeline: Pipeline, X_test, y_test, target_name: str) -> dict:
    """
    Compute rigorous classification metrics on holdout test set.
    """
    y_pred = pipeline.predict(X_test)
    accuracy = float(accuracy_score(y_test, y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average="weighted", zero_division=0
    )

    labels = sorted(list(set(y_test)))
    cm = confusion_matrix(y_test, y_pred, labels=labels).tolist()
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    return {
        "target": target_name,
        "test_samples": len(y_test),
        "accuracy": round(accuracy, 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "labels": labels,
        "confusion_matrix": cm,
        "classification_report": report,
    }


def train_models(data_path: str = DEFAULT_DATA_PATH, model_dir: str = DEFAULT_MODEL_DIR) -> dict:
    """
    Full training routine for Category and Priority classification.
    """
    print(f"Loading incident dataset from {data_path}...")
    df = load_dataset(data_path)
    print(f"Total labeled incidents: {len(df)}")

    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(os.path.dirname(DEFAULT_METRICS_PATH), exist_ok=True)

    metrics_result = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "total_dataset_size": len(df),
        "models": {},
    }

    # 1. Train Category Classifier
    print("Training Category classifier (TF-IDF + Logistic Regression)...")
    X_train_cat, X_test_cat, y_train_cat, y_test_cat = train_test_split(
        df["clean_text"],
        df["category"],
        test_size=0.20,
        random_state=42,
        stratify=df["category"],
    )

    category_pipeline = build_pipeline()
    category_pipeline.fit(X_train_cat, y_train_cat)
    cat_metrics = evaluate_model(category_pipeline, X_test_cat, y_test_cat, "category")
    metrics_result["models"]["category"] = cat_metrics

    cat_model_path = os.path.join(model_dir, "category_model.joblib")
    joblib.dump(category_pipeline, cat_model_path)
    print(f"Category Model saved -> {cat_model_path}")
    print(f"Category Accuracy: {cat_metrics['accuracy'] * 100:.2f}% | F1: {cat_metrics['f1_score']:.4f}")

    # 2. Train Priority Classifier
    print("Training Priority classifier (TF-IDF + Logistic Regression)...")
    X_train_pri, X_test_pri, y_train_pri, y_test_pri = train_test_split(
        df["clean_text"],
        df["priority"],
        test_size=0.20,
        random_state=42,
        stratify=df["priority"],
    )

    priority_pipeline = build_pipeline()
    priority_pipeline.fit(X_train_pri, y_train_pri)
    pri_metrics = evaluate_model(priority_pipeline, X_test_pri, y_test_pri, "priority")
    metrics_result["models"]["priority"] = pri_metrics

    pri_model_path = os.path.join(model_dir, "priority_model.joblib")
    joblib.dump(priority_pipeline, pri_model_path)
    print(f"Priority Model saved -> {pri_model_path}")
    print(f"Priority Accuracy: {pri_metrics['accuracy'] * 100:.2f}% | F1: {pri_metrics['f1_score']:.4f}")

    # Save metrics to JSON
    with open(DEFAULT_METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_result, f, indent=2)
    print(f"Model evaluation metrics saved -> {DEFAULT_METRICS_PATH}")

    return metrics_result


if __name__ == "__main__":
    train_models()
