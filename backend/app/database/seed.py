from datetime import datetime, timezone, timedelta
from app.database.session import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.ticket import (
    Ticket,
    TicketCategory,
    TicketPriority,
    TicketStatus,
    TicketComment,
    TicketHistory,
)
from app.models.sla import SLAConfiguration
from app.services.security import hash_password


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Default SLA Configurations
        slas = [
            (TicketPriority.CRITICAL, 1, 4),
            (TicketPriority.HIGH, 2, 8),
            (TicketPriority.MEDIUM, 4, 24),
            (TicketPriority.LOW, 8, 48),
        ]
        for priority, resp_hours, res_hours in slas:
            existing_sla = db.query(SLAConfiguration).filter(SLAConfiguration.priority == priority).first()
            if not existing_sla:
                sla = SLAConfiguration(
                    priority=priority,
                    response_time_hours=resp_hours,
                    resolution_time_hours=res_hours,
                )
                db.add(sla)

        # 2. Seed Default Users
        users_data = [
            {
                "email": "admin@nexusai.com",
                "password": "Admin@123456",
                "full_name": "System Administrator",
                "role": UserRole.ADMIN,
                "department": "IT Operations",
            },
            {
                "email": "agent@nexusai.com",
                "password": "Agent@123456",
                "full_name": "Sarah Connor",
                "role": UserRole.IT_SUPPORT,
                "department": "IT Helpdesk",
            },
            {
                "email": "employee@nexusai.com",
                "password": "Employee@123456",
                "full_name": "John Doe",
                "role": UserRole.EMPLOYEE,
                "department": "Sales & Marketing",
            },
        ]

        created_users = {}
        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    department=u["department"],
                    is_active=True,
                )
                db.add(user)
                db.flush()
                created_users[u["email"]] = user
            else:
                created_users[u["email"]] = existing

        # 3. Seed Sample Incidents
        now = datetime.now(timezone.utc)
        sample_tickets = [
            {
                "ticket_number": "INC-1001",
                "title": "Cannot connect to company database over VPN",
                "description": "My laptop is connected to Wi-Fi, but I cannot access the PostgreSQL production replica database via pgAdmin. Getting connection timeout error.",
                "category": TicketCategory.DATABASE,
                "priority": TicketPriority.HIGH,
                "status": TicketStatus.OPEN,
                "created_by_id": created_users["employee@nexusai.com"].id,
                "assigned_to_id": None,
                "due_date": now + timedelta(hours=8),
            },
            {
                "ticket_number": "INC-1002",
                "title": "Dual monitor display flickers on workstation dock",
                "description": "DisplayPort monitor randomly turns black for 3 seconds when connected through USB-C Thunderbolt docking station.",
                "category": TicketCategory.HARDWARE,
                "priority": TicketPriority.LOW,
                "status": TicketStatus.ASSIGNED,
                "created_by_id": created_users["employee@nexusai.com"].id,
                "assigned_to_id": created_users["agent@nexusai.com"].id,
                "due_date": now + timedelta(hours=48),
            },
            {
                "ticket_number": "INC-1003",
                "title": "Repeated Okta MFA push notification failure",
                "description": "Authentication push notification is not delivered to my phone when trying to log into the internal HR portal.",
                "category": TicketCategory.AUTHENTICATION,
                "priority": TicketPriority.CRITICAL,
                "status": TicketStatus.IN_PROGRESS,
                "created_by_id": created_users["employee@nexusai.com"].id,
                "assigned_to_id": created_users["agent@nexusai.com"].id,
                "due_date": now + timedelta(hours=4),
            },
        ]

        for t_data in sample_tickets:
            existing = db.query(Ticket).filter(Ticket.ticket_number == t_data["ticket_number"]).first()
            if not existing:
                t = Ticket(**t_data)
                db.add(t)
                db.flush()
                # Initial history entry
                h = TicketHistory(
                    ticket_id=t.id,
                    changed_by_id=t.created_by_id,
                    field_changed="status",
                    old_value=None,
                    new_value=t.status.value,
                )
                db.add(h)

        db.commit()
        print("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
