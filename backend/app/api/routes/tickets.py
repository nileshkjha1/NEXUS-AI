from math import ceil
from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import (
    get_db,
    get_current_active_user,
    require_roles,
)
from app.models.ticket import TicketCategory, TicketPriority, TicketStatus
from app.models.user import User, UserRole
from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketStatusUpdate,
    TicketAssign,
    TicketResponse,
    TicketDetailResponse,
    TicketListResponse,
    TicketCommentCreate,
    TicketCommentResponse,
    TicketHistoryResponse,
)
from app.services import ticket_service

router = APIRouter(prefix="/tickets", tags=["Incident Management"])


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a new incident ticket.
    Accessible to all authenticated users (Employees, Agents, Admins).
    """
    return ticket_service.create_ticket(db=db, ticket_in=ticket_in, user=current_user)


@router.get("", response_model=TicketListResponse)
def list_incidents(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term in title, description, ticket number"),
    status: Optional[TicketStatus] = Query(None, description="Filter by status"),
    priority: Optional[TicketPriority] = Query(None, description="Filter by priority"),
    category: Optional[TicketCategory] = Query(None, description="Filter by category"),
    assigned_to_id: Optional[int] = Query(None, description="Filter by assigned agent ID"),
    my_tickets_only: bool = Query(False, description="Filter only tickets created by current user"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    List incidents with search, filters, and pagination.
    Employees see only their own tickets; Support Agents and Admins see all.
    """
    items, total = ticket_service.get_tickets(
        db=db,
        user=current_user,
        page=page,
        size=size,
        search=search,
        status_filter=status,
        priority_filter=priority,
        category_filter=category,
        assigned_to_id=assigned_to_id,
        my_tickets_only=my_tickets_only,
    )
    total_pages = ceil(total / size) if total > 0 else 1
    return TicketListResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        total_pages=total_pages,
    )


@router.get("/{ticket_id}", response_model=TicketDetailResponse)
def get_incident_detail(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get full incident details including comments and history.
    """
    ticket = ticket_service.get_ticket_by_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket #{ticket_id} not found.",
        )

    # Authorization check
    if current_user.role == UserRole.EMPLOYEE and ticket.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this ticket.",
        )

    # Hide internal comments from employees
    visible_comments = ticket.comments
    if current_user.role == UserRole.EMPLOYEE:
        visible_comments = [c for c in ticket.comments if not c.is_internal]

    return TicketDetailResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        title=ticket.title,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status,
        created_by_id=ticket.created_by_id,
        assigned_to_id=ticket.assigned_to_id,
        resolution_notes=ticket.resolution_notes,
        resolved_at=ticket.resolved_at,
        closed_at=ticket.closed_at,
        due_date=ticket.due_date,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        creator=ticket.creator,
        assignee=ticket.assignee,
        comments=visible_comments,
        history=ticket.history,
    )


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_incident(
    ticket_id: int,
    ticket_in: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update ticket fields.
    Employees can update their own ticket while still Open.
    Agents and Admins can update any ticket.
    """
    ticket = ticket_service.get_ticket_by_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket #{ticket_id} not found.",
        )

    if current_user.role == UserRole.EMPLOYEE:
        if ticket.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to edit this ticket.",
            )
        if ticket.status != TicketStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employees cannot edit tickets once work has commenced or status has changed.",
            )

    return ticket_service.update_ticket(
        db=db,
        ticket=ticket,
        ticket_in=ticket_in,
        user=current_user,
    )


@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def update_incident_status(
    ticket_id: int,
    status_in: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([UserRole.IT_SUPPORT, UserRole.ADMIN])
    ),
) -> Any:
    """
    Change incident status (Agents & Admins).
    """
    ticket = ticket_service.get_ticket_by_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket #{ticket_id} not found.",
        )

    ticket_update = TicketUpdate(
        status=status_in.status,
        resolution_notes=status_in.resolution_notes,
    )
    return ticket_service.update_ticket(
        db=db,
        ticket=ticket,
        ticket_in=ticket_update,
        user=current_user,
    )


@router.post("/{ticket_id}/assign", response_model=TicketResponse)
def assign_incident(
    ticket_id: int,
    assign_in: TicketAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([UserRole.IT_SUPPORT, UserRole.ADMIN])
    ),
) -> Any:
    """
    Assign ticket to an IT Support Agent or Admin.
    """
    ticket = ticket_service.get_ticket_by_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket #{ticket_id} not found.",
        )

    assignee = db.query(User).filter(User.id == assign_in.assigned_to_id).first()
    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User #{assign_in.assigned_to_id} not found.",
        )
    if assignee.role not in [UserRole.IT_SUPPORT, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tickets can only be assigned to IT Support Agents or Administrators.",
        )

    return ticket_service.assign_ticket(
        db=db,
        ticket=ticket,
        assign_in=assign_in,
        assigned_by=current_user,
    )


@router.post("/{ticket_id}/comments", response_model=TicketCommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    ticket_id: int,
    comment_in: TicketCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Add a comment to an incident.
    Only IT Support and Admin may set is_internal=True.
    """
    ticket = ticket_service.get_ticket_by_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket #{ticket_id} not found.",
        )

    if current_user.role == UserRole.EMPLOYEE and ticket.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to comment on this ticket.",
        )

    # Restrict internal comments to staff
    is_internal = comment_in.is_internal
    if is_internal and current_user.role == UserRole.EMPLOYEE:
        is_internal = False

    comment = ticket_service.add_ticket_comment(
        db=db,
        ticket_id=ticket_id,
        user_id=current_user.id,
        comment_text=comment_in.comment,
        is_internal=is_internal,
    )
    return comment


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
) -> None:
    """
    Delete an incident ticket (Administrator only).
    """
    ticket = ticket_service.get_ticket_by_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket #{ticket_id} not found.",
        )
    db.delete(ticket)
    db.commit()
    return None
