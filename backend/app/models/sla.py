from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, Enum
from app.database.session import Base
from app.models.ticket import TicketPriority


class SLAConfiguration(Base):
    __tablename__ = "sla_configurations"

    id = Column(Integer, primary_key=True, index=True)
    priority = Column(Enum(TicketPriority), unique=True, nullable=False, index=True)
    response_time_hours = Column(Integer, nullable=False)
    resolution_time_hours = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

