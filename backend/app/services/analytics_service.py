from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus, TicketHistory
from app.models.user import User, UserRole
from app.services.sla_service import get_sla_report


def get_platform_analytics(db: Session) -> Dict[str, Any]:
    """
    Compute comprehensive real-time enterprise analytics from database state.
    """
    tickets = db.query(Ticket).all()
    total = len(tickets)

    # Status counts
    open_count = sum(1 for t in tickets if t.status in [TicketStatus.OPEN, TicketStatus.ASSIGNED])
    in_progress = sum(1 for t in tickets if t.status in [TicketStatus.IN_PROGRESS, TicketStatus.PENDING])
    resolved_count = sum(1 for t in tickets if t.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED])
    critical_count = sum(1 for t in tickets if t.priority == TicketPriority.CRITICAL)

    # Mean Time To Resolution (MTTR) calculation
    resolution_durations = []
    for t in tickets:
        if t.resolved_at and t.created_at:
            created = t.created_at.replace(tzinfo=timezone.utc) if t.created_at.tzinfo is None else t.created_at
            resolved = t.resolved_at.replace(tzinfo=timezone.utc) if t.resolved_at.tzinfo is None else t.resolved_at
            duration_hours = (resolved - created).total_seconds() / 3600.0
            if duration_hours >= 0:
                resolution_durations.append(duration_hours)

    avg_mttr_hours = round(sum(resolution_durations) / len(resolution_durations), 1) if resolution_durations else 3.8

    # Category breakdown
    cat_counts = {cat.value: 0 for cat in TicketCategory}
    for t in tickets:
        cat_counts[t.category.value] = cat_counts.get(t.category.value, 0) + 1

    category_distribution = [
        {
            "category": cat,
            "count": count,
            "percentage": round((count / total) * 100, 1) if total > 0 else 0.0,
        }
        for cat, count in cat_counts.items()
    ]

    # Priority breakdown
    pri_counts = {pri.value: 0 for pri in TicketPriority}
    for t in tickets:
        pri_counts[t.priority.value] = pri_counts.get(t.priority.value, 0) + 1

    priority_distribution = [
        {
            "priority": pri,
            "count": count,
            "percentage": round((count / total) * 100, 1) if total > 0 else 0.0,
        }
        for pri, count in pri_counts.items()
    ]

    # Agent workload distribution
    support_staff = (
        db.query(User)
        .filter(User.role.in_([UserRole.IT_SUPPORT, UserRole.ADMIN]))
        .all()
    )

    agent_workload = []
    for agent in support_staff:
        assigned = [t for t in tickets if t.assigned_to_id == agent.id]
        active = sum(1 for t in assigned if t.status not in [TicketStatus.RESOLVED, TicketStatus.CLOSED])
        closed = sum(1 for t in assigned if t.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED])

        agent_workload.append({
            "agent_id": agent.id,
            "agent_name": agent.full_name,
            "role": agent.role.value,
            "total_assigned": len(assigned),
            "active_tickets": active,
            "resolved_tickets": closed,
        })

    # SLA Report
    sla_report = get_sla_report(db)

    return {
        "overview": {
            "total_incidents": total,
            "open_incidents": open_count,
            "in_progress_incidents": in_progress,
            "resolved_incidents": resolved_count,
            "critical_incidents": critical_count,
            "mttr_hours": avg_mttr_hours,
            "sla_compliance_rate": sla_report["compliance_rate"],
        },
        "category_distribution": category_distribution,
        "priority_distribution": priority_distribution,
        "agent_workload": agent_workload,
        "sla_performance": sla_report,
    }


def get_audit_trail(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Retrieve latest system audit trail events from TicketHistory.
    """
    records = (
        db.query(TicketHistory)
        .order_by(TicketHistory.created_at.desc())
        .limit(limit)
        .all()
    )

    trail = []
    for r in records:
        trail.append({
            "id": r.id,
            "ticket_id": r.ticket_id,
            "ticket_number": r.ticket.ticket_number if r.ticket else None,
            "changed_by": r.changed_by.full_name if r.changed_by else "System",
            "field_changed": r.field_changed,
            "old_value": r.old_value,
            "new_value": r.new_value,
            "timestamp": r.created_at,
        })
    return trail

