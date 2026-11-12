import pytest
from datetime import datetime, timezone, timedelta
from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.models.user import User
from app.services import sla_service, analytics_service, notification_service


def get_token(client, email, password):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]


def test_sla_status_calculation(db_session):
    now = datetime.now(timezone.utc)
    # Ticket with due date in future
    ticket_on_track = Ticket(
        ticket_number="INC-SLA-1",
        title="Future SLA ticket",
        description="Testing SLA calculation",
        category=TicketCategory.NETWORK,
        priority=TicketPriority.MEDIUM,
        status=TicketStatus.OPEN,
        created_by_id=1,
        due_date=now + timedelta(hours=10),
    )
    sla_track = sla_service.get_sla_status(ticket_on_track, now)
    assert sla_track["has_sla"] is True
    assert sla_track["is_breached"] is False
    assert sla_track["status"] == "On Track"
    assert sla_track["hours_remaining"] > 0

    # Overdue ticket
    ticket_breached = Ticket(
        ticket_number="INC-SLA-2",
        title="Overdue ticket",
        description="Testing SLA breach",
        category=TicketCategory.DATABASE,
        priority=TicketPriority.CRITICAL,
        status=TicketStatus.OPEN,
        created_by_id=1,
        due_date=now - timedelta(hours=3),
    )
    sla_breached = sla_service.get_sla_status(ticket_breached, now)
    assert sla_breached["is_breached"] is True
    assert sla_breached["status"] == "Breached"
    assert sla_breached["hours_overdue"] >= 3.0


def test_sla_report_service(db_session):
    report = sla_service.get_sla_report(db_session)
    assert "total_tickets" in report
    assert "compliance_rate" in report
    assert "compliant_count" in report
    assert "breached_count" in report
    assert isinstance(report["compliance_rate"], (int, float))


def test_platform_analytics_service(db_session):
    analytics = analytics_service.get_platform_analytics(db_session)
    assert "overview" in analytics
    assert "category_distribution" in analytics
    assert "priority_distribution" in analytics
    assert "agent_workload" in analytics
    assert "sla_performance" in analytics

    overview = analytics["overview"]
    assert "total_incidents" in overview
    assert "mttr_hours" in overview
    assert "sla_compliance_rate" in overview


def test_notification_service_flow(db_session):
    user = db_session.query(User).filter(User.email == "employee@nexusai.com").first()
    assert user is not None

    # Create notification
    notif = notification_service.create_notification(
        db=db_session,
        user_id=user.id,
        title="Test Notification Alert",
        message="This is a test notification message.",
        notification_type="info",
    )
    assert notif.id is not None
    assert notif.is_read is False

    # Get notifications
    items, unread = notification_service.get_user_notifications(db_session, user.id)
    assert unread >= 1
    assert any(n.id == notif.id for n in items)

    # Mark as read
    updated = notification_service.mark_notification_as_read(db_session, notif.id, user.id)
    assert updated is not None
    assert updated.is_read is True

    # Mark all as read
    count = notification_service.mark_all_notifications_as_read(db_session, user.id)
    assert isinstance(count, int)


def test_analytics_api_rbac(client):
    admin_token = get_token(client, "admin@nexusai.com", "Admin@123456")
    employee_token = get_token(client, "employee@nexusai.com", "Employee@123456")

    # Admin allowed
    resp_admin = client.get(
        "/api/v1/analytics/overview",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp_admin.status_code == 200
    data = resp_admin.json()
    assert "overview" in data
    assert "agent_workload" in data

    # Employee forbidden from global analytics overview
    resp_emp = client.get(
        "/api/v1/analytics/overview",
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert resp_emp.status_code == 403


def test_sla_report_api(client):
    agent_token = get_token(client, "agent@nexusai.com", "Agent@123456")
    resp = client.get(
        "/api/v1/analytics/sla",
        headers={"Authorization": f"Bearer {agent_token}"},
    )
    assert resp.status_code == 200
    assert "compliance_rate" in resp.json()


def test_audit_logs_api(client):
    admin_token = get_token(client, "admin@nexusai.com", "Admin@123456")
    agent_token = get_token(client, "agent@nexusai.com", "Agent@123456")

    # Admin allowed
    resp_admin = client.get(
        "/api/v1/analytics/audit-logs?limit=10",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp_admin.status_code == 200
    assert isinstance(resp_admin.json(), list)

    # Agent forbidden from global audit logs
    resp_agent = client.get(
        "/api/v1/analytics/audit-logs",
        headers={"Authorization": f"Bearer {agent_token}"},
    )
    assert resp_agent.status_code == 403


def test_notifications_api(client):
    emp_token = get_token(client, "employee@nexusai.com", "Employee@123456")

    # List notifications
    resp = client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "unread_count" in data

    # Mark all read
    resp_mark = client.post(
        "/api/v1/notifications/mark-all-read",
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert resp_mark.status_code == 200
    assert "updated_count" in resp_mark.json()

