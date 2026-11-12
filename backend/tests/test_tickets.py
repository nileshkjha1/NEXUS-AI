import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def admin_token():
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@nexusai.com", "password": "Admin@123456"},
    )
    return resp.json()["access_token"]


@pytest.fixture(scope="module")
def agent_token():
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "agent@nexusai.com", "password": "Agent@123456"},
    )
    return resp.json()["access_token"]


@pytest.fixture(scope="module")
def employee_token():
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "employee@nexusai.com", "password": "Employee@123456"},
    )
    return resp.json()["access_token"]


def test_create_ticket(employee_token):
    resp = client.post(
        "/api/v1/tickets",
        json={
            "title": "VPN connection drops every 10 minutes",
            "description": "Whenever I connect to the enterprise VPN tunnel, the connection drops reliably after 10 minutes.",
            "category": "Network",
            "priority": "High",
        },
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "VPN connection drops every 10 minutes"
    assert data["status"] == "Open"
    assert data["ticket_number"].startswith("INC-")
    assert data["due_date"] is not None


def test_list_tickets(employee_token, admin_token):
    # Employee view
    emp_resp = client.get(
        "/api/v1/tickets",
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert emp_resp.status_code == 200
    emp_data = emp_resp.json()
    assert "items" in emp_data
    assert "total" in emp_data

    # Admin view
    admin_resp = client.get(
        "/api/v1/tickets",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_resp.status_code == 200
    admin_data = admin_resp.json()
    assert admin_data["total"] >= emp_data["total"]


def test_ticket_detail_with_comment(employee_token, agent_token):
    # Create ticket
    create_resp = client.post(
        "/api/v1/tickets",
        json={
            "title": "Printer on 3rd floor paper jam",
            "description": "The main laser printer on the 3rd floor executive wing is jammed with tray 2 error.",
            "category": "Hardware",
            "priority": "Low",
        },
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    ticket_id = create_resp.json()["id"]

    # Agent adds an internal comment
    comm_resp = client.post(
        f"/api/v1/tickets/{ticket_id}/comments",
        json={
            "comment": "Internal note: dispatched technician with replacement roller.",
            "is_internal": True,
        },
        headers={"Authorization": f"Bearer {agent_token}"},
    )
    assert comm_resp.status_code == 201

    # Employee views ticket: internal comment should NOT be visible
    emp_view = client.get(
        f"/api/v1/tickets/{ticket_id}",
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert emp_view.status_code == 200
    comments = emp_view.json()["comments"]
    assert len([c for c in comments if c["is_internal"]]) == 0

    # Agent views ticket: internal comment IS visible
    agent_view = client.get(
        f"/api/v1/tickets/{ticket_id}",
        headers={"Authorization": f"Bearer {agent_token}"},
    )
    assert agent_view.status_code == 200
    agent_comments = agent_view.json()["comments"]
    assert any(c["is_internal"] for c in agent_comments)


def test_assign_ticket(admin_token, agent_token):
    # Admin assigns ticket to Agent
    # First get agent user ID
    users_resp = client.get(
        "/api/v1/users?role=IT%20Support%20Agent",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    agent_id = users_resp.json()[0]["id"]

    # Assign INC-1001 (id 1)
    assign_resp = client.post(
        "/api/v1/tickets/1/assign",
        json={"assigned_to_id": agent_id, "notes": "Please look into database connectivity."},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["assigned_to_id"] == agent_id
    assert assign_resp.json()["status"] == "Assigned"


def test_update_ticket_status_to_resolved(agent_token):
    resp = client.patch(
        "/api/v1/tickets/1/status",
        json={
            "status": "Resolved",
            "resolution_notes": "Restarted the PostgreSQL connection pooler and refreshed routing table.",
        },
        headers={"Authorization": f"Bearer {agent_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "Resolved"
    assert data["resolved_at"] is not None
    assert data["resolution_notes"] is not None


def test_delete_ticket_permission(employee_token, admin_token):
    # Employee cannot delete ticket
    emp_del = client.delete(
        "/api/v1/tickets/2",
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert emp_del.status_code == 403

    # Admin can delete ticket
    admin_del = client.delete(
        "/api/v1/tickets/2",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_del.status_code == 204
