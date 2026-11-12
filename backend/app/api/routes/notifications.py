from typing import Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationListResponse
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_user_notifications_endpoint(
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve notification feed for the authenticated user and count of unread notifications.
    """
    items, unread_count = notification_service.get_user_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit,
    )
    return NotificationListResponse(items=items, unread_count=unread_count)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read_endpoint(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Mark an individual notification as read.
    """
    notif = notification_service.mark_notification_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
    )
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return notif


@router.post("/mark-all-read")
def mark_all_read_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Mark all unread notifications as read for current user.
    """
    count = notification_service.mark_all_notifications_as_read(
        db=db,
        user_id=current_user.id,
    )
    return {"message": "All notifications marked as read", "updated_count": count}

