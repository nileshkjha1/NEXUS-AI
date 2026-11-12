from datetime import datetime, timezone, timedelta
from typing import Optional, List, Tuple
from sqlalchemy import or_, desc
from sqlalchemy.orm import Session

from app.models.ticket import (
    Ticket,
    TicketComment,
    TicketHistory,
    Assignment,
    TicketCategory,
    TicketPriority,
    TicketStatus,
)
from app.models.user import User, UserRole
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketStatusUpdate, TicketAssign


# Default SLA resolution time targets (hours) by priority
DEFAULT_SLA_HOURS = {
    TicketPriority.CRITICAL: 4,
    TicketPriority.HIGH: 8,
    TicketPriority.MEDIUM: 24,
    TicketPriority.LOW: 48,
}


def generate_ticket_number(db: Session) -> str:
    """
    Generate unique incremental ticket number, e.g. INC-1001.
    """
    last_ticket = db.query(Ticket).order_by(desc(Ticket.id)).first()
    next_id = (last_ticket.id + 1001) if last_ticket else 1001
    return f"INC-{next_id}"


def calculate_due_date(priority: TicketPriority, start_time: datetime) -> datetime:
    hours = DEFAULT_SLA_HOURS.get(priority, 24)
    return start_time + timedelta(hours=hours)


def create_ticket(db: Session, ticket_in: TicketCreate, user: User) -> Ticket:
    now = datetime.now(timezone.utc)
    ticket_num = generate_ticket_number(db)
    due_date = calculate_due_date(ticket_in.priority, now)

    ticket = Ticket(
        ticket_number=ticket_num,
        title=ticket_in.title,
        description=ticket_in.description,
        category=ticket_in.category,
        priority=ticket_in.priority,
        status=TicketStatus.OPEN,
        created_by_id=user.id,
        due_date=due_date,
    )
    db.add(ticket)
    db.flush()

    # Create initial audit log
    history = TicketHistory(
        ticket_id=ticket.id,
        changed_by_id=user.id,
        field_changed="status",
        old_value=None,
        new_value=TicketStatus.OPEN.value,
    )
    db.add(history)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_tickets(
    db: Session,
    user: User,
    page: int = 1,
    size: int = 20,
    search: Optional[str] = None,
    status_filter: Optional[TicketStatus] = None,
    priority_filter: Optional[TicketPriority] = None,
    category_filter: Optional[TicketCategory] = None,
    assigned_to_id: Optional[int] = None,
    my_tickets_only: bool = False,
) -> Tuple[List[Ticket], int]:
    query = db.query(Ticket)

    # Role-based scoping: Employees only see their own tickets unless they are viewing public lists
    if user.role == UserRole.EMPLOYEE or my_tickets_only:
        query = query.filter(Ticket.created_by_id == user.id)

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Ticket.title.ilike(search_pattern),
                Ticket.description.ilike(search_pattern),
                Ticket.ticket_number.ilike(search_pattern),
            )
        )

    # Field filters
    if status_filter:
        query = query.filter(Ticket.status == status_filter)
    if priority_filter:
        query = query.filter(Ticket.priority == priority_filter)
    if category_filter:
        query = query.filter(Ticket.category == category_filter)
    if assigned_to_id:
        query = query.filter(Ticket.assigned_to_id == assigned_to_id)

    total = query.count()
    offset = (page - 1) * size
    items = query.order_by(desc(Ticket.created_at)).offset(offset).limit(size).all()
    return items, total


def get_ticket_by_id(db: Session, ticket_id: int) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def record_history(
    db: Session,
    ticket_id: int,
    user_id: int,
    field_name: str,
    old_val: Optional[str],
    new_val: Optional[str],
) -> None:
    if old_val != new_val:
        entry = TicketHistory(
            ticket_id=ticket_id,
            changed_by_id=user_id,
            field_changed=field_name,
            old_value=str(old_val) if old_val is not None else None,
            new_value=str(new_val) if new_val is not None else None,
        )
        db.add(entry)


def update_ticket(
    db: Session,
    ticket: Ticket,
    ticket_in: TicketUpdate,
    user: User,
) -> Ticket:
    now = datetime.now(timezone.utc)
    update_data = ticket_in.model_dump(exclude_unset=True)

    for field, new_val in update_data.items():
        old_val = getattr(ticket, field)
        if old_val != new_val:
            setattr(ticket, field, new_val)
            record_history(
                db=db,
                ticket_id=ticket.id,
                user_id=user.id,
                field_name=field,
                old_val=str(old_val.value if hasattr(old_val, "value") else old_val),
                new_val=str(new_val.value if hasattr(new_val, "value") else new_val),
            )

    # Check status transitions
    if "status" in update_data:
        if update_data["status"] == TicketStatus.RESOLVED and not ticket.resolved_at:
            ticket.resolved_at = now
        elif update_data["status"] == TicketStatus.CLOSED and not ticket.closed_at:
            ticket.closed_at = now

    ticket.updated_at = now
    db.commit()
    db.refresh(ticket)
    return ticket


def assign_ticket(
    db: Session,
    ticket: Ticket,
    assign_in: TicketAssign,
    assigned_by: User,
) -> Ticket:
    now = datetime.now(timezone.utc)
    old_assignee_id = ticket.assigned_to_id
    ticket.assigned_to_id = assign_in.assigned_to_id

    if ticket.status == TicketStatus.OPEN:
        ticket.status = TicketStatus.ASSIGNED
        record_history(
            db=db,
            ticket_id=ticket.id,
            user_id=assigned_by.id,
            field_name="status",
            old_val=TicketStatus.OPEN.value,
            new_val=TicketStatus.ASSIGNED.value,
        )

    record_history(
        db=db,
        ticket_id=ticket.id,
        user_id=assigned_by.id,
        field_name="assigned_to_id",
        old_val=str(old_assignee_id) if old_assignee_id else "Unassigned",
        new_val=str(assign_in.assigned_to_id),
    )

    assignment = Assignment(
        ticket_id=ticket.id,
        assigned_to_id=assign_in.assigned_to_id,
        assigned_by_id=assigned_by.id,
        notes=assign_in.notes,
    )
    db.add(assignment)
    ticket.updated_at = now
    db.commit()
    db.refresh(ticket)
    return ticket


def add_ticket_comment(
    db: Session,
    ticket_id: int,
    user_id: int,
    comment_text: str,
    is_internal: bool = False,
) -> TicketComment:
    comment = TicketComment(
        ticket_id=ticket_id,
        user_id=user_id,
        comment=comment_text,
        is_internal=is_internal,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
