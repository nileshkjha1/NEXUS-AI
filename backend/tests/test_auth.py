import pytest


def test_user_registration(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "testregister@company.com",
            "password": "Password123!",
            "full_name": "Test Register User",
            "department": "Engineering",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testregister@company.com"
    assert data["full_name"] == "Test Register User"
    assert "id" in data
    assert "hashed_password" not in data


def test_duplicate_registration_fails(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "testregister@company.com",
            "password": "Password123!",
            "full_name": "Test Register User",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_json_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testregister@company.com",
            "password": "Password123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "testregister@company.com"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testregister@company.com",
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401


def test_get_me_authenticated(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "testregister@company.com", "password": "Password123!"},
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "testregister@company.com"


def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
