from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.models.sla import SLAConfiguration


def get_sla_status(ticket: Ticket, now: datetime = None) -> Dict[str, Any]:
    """
    Compute real-time SLA status and time remaining for a ticket.
    """
    if now is None:
        now = datetime.now(timezone.utc)

    due_date = ticket.due_date
    if not due_date:
        return {
            "has_sla": False,
            "is_breached": False,
            "is_at_risk": False,
            "hours_remaining": None,
            "hours_overdue": 0.0,
            "status": "No SLA",
        }

    # Ensure timezone awareness
    if due_date.tzinfo is None:
        due_date = due_date.replace(tzinfo=timezone.utc)

    # If ticket is resolved/closed, compare resolution time to due date
    if ticket.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
        resolved_time = ticket.resolved_at or ticket.closed_at or ticket.updated_at
        if resolved_time.tzinfo is None:
            resolved_time = resolved_time.replace(tzinfo=timezone.utc)

        is_breached = resolved_time > due_date
        return {
            "has_sla": True,
            "is_breached": is_breached,
            "is_at_risk": False,
            "resolved_within_sla": not is_breached,
            "hours_remaining": 0.0,
            "hours_overdue": round(max(0.0, (resolved_time - due_date).total_seconds() / 3600), 1),
            "status": "Breached" if is_breached else "Compliant",
        }

    # For active tickets
    diff_seconds = (due_date - now).total_seconds()
    hours_remaining = diff_seconds / 3600.0
    is_breached = hours_remaining < 0.0
    is_at_risk = not is_breached and hours_remaining <= 2.0

    return {
        "has_sla": True,
        "is_breached": is_breached,
        "is_at_risk": is_at_risk,
        "hours_remaining": round(max(0.0, hours_remaining), 1),
        "hours_overdue": round(abs(hours_remaining), 1) if is_breached else 0.0,
        "status": "Breached" if is_breached else ("At Risk" if is_at_risk else "On Track"),
    }


def get_sla_report(db: Session) -> Dict[str, Any]:
    """
    Compute organizational SLA metrics across all tickets.
    """
    now = datetime.now(timezone.utc)
    tickets = db.query(Ticket).all()

    total = len(tickets)
    if total == 0:
        return {
            "total_tickets": 0,
            "compliant_count": 0,
            "breached_count": 0,
            "at_risk_count": 0,
            "compliance_rate": 100.0,
            "breached_tickets": [],
        }

    breached = 0
    at_risk = 0
    compliant = 0
    breached_tickets = []

    for t in tickets:
        sla = get_sla_status(t, now)
        if sla["is_breached"]:
            breached += 1
            breached_tickets.append({
                "id": t.id,
                "ticket_number": t.ticket_number,
                "title": t.title,
                "priority": t.priority.value,
                "status": t.status.value,
                "hours_overdue": sla["hours_overdue"],
            })
        else:
            compliant += 1
            if sla["is_at_risk"]:
                at_risk += 1

    compliance_rate = round((compliant / total) * 100, 1)

    return {
        "total_tickets": total,
        "compliant_count": compliant,
        "breached_count": breached,
        "at_risk_count": at_risk,
        "compliance_rate": compliance_rate,
        "breached_tickets": breached_tickets,
    }
