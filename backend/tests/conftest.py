import os
import sys
import pytest

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database.session import Base, get_db
from app.models.user import User, UserRole
from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.models.sla import SLAConfiguration
from app.services.security import hash_password
from app.main import app

# In-memory SQLite database dedicated for tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Seed test users
    admin = User(
        email="admin@nexusai.com",
        hashed_password=hash_password("Admin@123456"),
        full_name="System Administrator",
        role=UserRole.ADMIN,
        is_active=True,
    )
    agent = User(
        email="agent@nexusai.com",
        hashed_password=hash_password("Agent@123456"),
        full_name="Sarah Connor",
        role=UserRole.IT_SUPPORT,
        is_active=True,
    )
    employee = User(
        email="employee@nexusai.com",
        hashed_password=hash_password("Employee@123456"),
        full_name="John Doe",
        role=UserRole.EMPLOYEE,
        is_active=True,
    )
    db.add_all([admin, agent, employee])

    # Seed test SLA
    for p, resp, res in [
        (TicketPriority.CRITICAL, 1, 4),
        (TicketPriority.HIGH, 2, 8),
        (TicketPriority.MEDIUM, 4, 24),
        (TicketPriority.LOW, 8, 48),
    ]:
        db.add(SLAConfiguration(priority=p, response_time_hours=resp, resolution_time_hours=res))

    # Seed test tickets
    db.flush()
    t1 = Ticket(
        ticket_number="INC-1001",
        title="Database connection timeout",
        description="Cannot reach PostgreSQL replica through VPN tunnel.",
        category=TicketCategory.DATABASE,
        priority=TicketPriority.HIGH,
        status=TicketStatus.OPEN,
        created_by_id=employee.id,
    )
    t2 = Ticket(
        ticket_number="INC-1002",
        title="Docking station monitor issue",
        description="Monitor flickers when connected to dock.",
        category=TicketCategory.HARDWARE,
        priority=TicketPriority.LOW,
        status=TicketStatus.ASSIGNED,
        created_by_id=employee.id,
        assigned_to_id=agent.id,
    )
    db.add_all([t1, t2])
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(setup_test_db):
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

