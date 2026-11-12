import pytest
from app.ml.preprocessing import clean_text
from app.ml.predict import get_model_manager


@pytest.fixture
def auth_headers(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "employee@nexusai.com", "password": "Employee@123456"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@nexusai.com", "password": "Admin@123456"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_clean_text():
    raw = "My laptop cannot reach https://db.nexus.internal at 192.168.1.100!! It's broken."
    cleaned = clean_text(raw)
    assert "https" not in cleaned
    assert "ipaddress" in cleaned
    assert "broken" in cleaned
    assert "it's" not in cleaned  # punctuation stripped


def test_predict_category_direct():
    manager = get_model_manager()
    res = manager.predict_category("PostgreSQL database connection pool exhausted with timeout")
    assert "predicted_category" in res
    assert res["predicted_category"] == "Database"
    assert res["confidence"] > 0.50
    assert "probabilities" in res


def test_predict_priority_direct():
    manager = get_model_manager()
    res = manager.predict_priority("Production payment API completely down and 500 internal server error")
    assert "predicted_priority" in res
    assert res["predicted_priority"] in ["High", "Critical"]
    assert res["confidence"] > 0.40


def test_api_predict_category(client, auth_headers):
    resp = client.post(
        "/api/v1/ml/predict-category",
        json={"text": "Cisco core switch port failure and BGP route flap"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["prediction"] == "Network"
    assert data["confidence"] > 0.50


def test_api_predict_priority(client, auth_headers):
    resp = client.post(
        "/api/v1/ml/predict-priority",
        json={"text": "Ransomware encryption detected on file server partition files locked"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["prediction"] in ["Critical", "High"]


def test_api_triage(client, auth_headers):
    resp = client.post(
        "/api/v1/ml/triage",
        json={
            "title": "Cannot access company database",
            "description": "My laptop is connected to Wi-Fi, but I cannot access the PostgreSQL production database.",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["predicted_category"] == "Database"
    assert "category_probabilities" in data
    assert "predicted_priority" in data


def test_api_metrics(client, auth_headers):
    resp = client.get("/api/v1/ml/metrics", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "models" in data
    assert "category" in data["models"]
    assert "priority" in data["models"]
    assert data["models"]["category"]["accuracy"] > 0.80
    assert data["models"]["priority"]["accuracy"] > 0.70


def test_auto_classification_on_ticket_creation(client, auth_headers):
    # When an employee submits with category="Other", the ML model automatically classifies it!
    resp = client.post(
        "/api/v1/tickets",
        json={
            "title": "Dual monitor external display flickering black",
            "description": "The DisplayPort external screen keeps flickering black when connected to dock.",
            "category": "Other",
            "priority": "Low",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    # Should be auto-classified as Hardware instead of staying as Other
    assert data["category"] == "Hardware"
