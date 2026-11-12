import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.models.notification import Notification
from app.models.user import User
from app.models.ticket import Ticket


def send_email_dispatch(to_email: str, subject: str, body_text: str) -> bool:
    """
    Send an email via SMTP or record to structured event log when offline.
    """
    if not settings.EMAILS_ENABLED or not settings.SMTP_HOST:
        print(f"[EMAIL MOCK DISPATCH] To: {to_email} | Subject: {subject}\n{body_text}\n" + "-"*40)
        return True

    try:
        msg = MIMEMultipart()
        msg["From"] = settings.EMAILS_FROM
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body_text, "plain"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=5) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")
        return False


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
    ticket_id: Optional[int] = None,
    user_email: Optional[str] = None,
) -> Notification:
    """
    Create a notification in the database and trigger email dispatch.
    """
    notif = Notification(
        user_id=user_id,
        ticket_id=ticket_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    if user_email:
        send_email_dispatch(
            to_email=user_email,
            subject=f"[NEXUS AI] {title}",
            body_text=message,
        )

    return notif


def notify_ticket_created(ticket: Ticket, creator: User, db: Session):
    title = f"Incident Created: {ticket.ticket_number}"
    message = (
        f"Hello {creator.full_name},\n\n"
        f"Your incident ticket '{ticket.title}' ({ticket.ticket_number}) has been created.\n"
        f"Category: {ticket.category.value}\n"
        f"Priority: {ticket.priority.value}\n"
        f"Our IT operations team has been notified."
    )
    create_notification(
        db=db,
        user_id=creator.id,
        title=title,
        message=message,
        notification_type="ticket_created",
        ticket_id=ticket.id,
        user_email=creator.email,
    )


def notify_ticket_assigned(ticket: Ticket, assignee: User, assigned_by: User, db: Session):
    title = f"Ticket Assigned to You: {ticket.ticket_number}"
    message = (
        f"Hello {assignee.full_name},\n\n"
        f"You have been assigned to incident {ticket.ticket_number}: '{ticket.title}'.\n"
        f"Priority: {ticket.priority.value}\n"
        f"Assigned by: {assigned_by.full_name}."
    )
    create_notification(
        db=db,
        user_id=assignee.id,
        title=title,
        message=message,
        notification_type="ticket_assigned",
        ticket_id=ticket.id,
        user_email=assignee.email,
    )


def notify_ticket_status_changed(ticket: Ticket, old_status: str, new_status: str, changed_by: User, db: Session):
    title = f"Incident Status Updated: {ticket.ticket_number}"
    message = (
        f"Incident {ticket.ticket_number} ('{ticket.title}') status has been updated from "
        f"{old_status} to {new_status} by {changed_by.full_name}."
    )
    if ticket.resolution_notes and new_status == "Resolved":
        message += f"\n\nResolution Summary:\n{ticket.resolution_notes}"

    # Notify ticket creator
    create_notification(
        db=db,
        user_id=ticket.created_by_id,
        title=title,
        message=message,
        notification_type="status_changed",
        ticket_id=ticket.id,
        user_email=ticket.creator.email if ticket.creator else None,
    )


def notify_sla_warning(ticket: Ticket, hours_remaining: float, db: Session):
    title = f"SLA Warning: {ticket.ticket_number} Approaching Breach"
    message = (
        f"ATTENTION: Incident {ticket.ticket_number} ({ticket.priority.value}) has only "
        f"{hours_remaining:.1f} hours remaining before SLA target resolution breach!"
    )
    recipient_id = ticket.assigned_to_id or ticket.created_by_id
    create_notification(
        db=db,
        user_id=recipient_id,
        title=title,
        message=message,
        notification_type="sla_warning",
        ticket_id=ticket.id,
        user_email=ticket.assignee.email if ticket.assignee else None,
    )


def get_user_notifications(
    db: Session,
    user_id: int,
    unread_only: bool = False,
    limit: int = 50,
) -> tuple[list[Notification], int]:
    """
    Retrieve user notifications ordered chronologically descending, along with total unread count.
    """
    query = db.query(Notification).filter(Notification.user_id == user_id)
    unread_count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read.is_(False)
    ).count()

    if unread_only:
        query = query.filter(Notification.is_read.is_(False))

    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    return notifications, unread_count


def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    """
    Mark a specific notification as read for the authenticated user.
    """
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id,
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif


def mark_all_notifications_as_read(db: Session, user_id: int) -> int:
    """
    Mark all unread notifications as read for the authenticated user.
    """
    updated = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read.is_(False),
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return updated

