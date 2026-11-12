import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_user_registration():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "Password123!",
            "full_name": "New Test User",
            "department": "Engineering",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["full_name"] == "New Test User"
    assert "id" in data
    assert "hashed_password" not in data


def test_duplicate_registration_fails():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "Password123!",
            "full_name": "New Test User Duplicate",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_json_success():
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "newuser@test.com",
            "password": "Password123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@test.com"


def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "newuser@test.com",
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401


def test_get_me_authenticated():
    # Login first
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "newuser@test.com", "password": "Password123!"},
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "newuser@test.com"


def test_get_me_unauthorized():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
