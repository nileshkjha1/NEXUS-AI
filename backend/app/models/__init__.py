from app.database.session import Base
from app.models.user import User, UserRole
from app.models.ticket import (
    Ticket,
    TicketComment,
    TicketHistory,
    Assignment,
    TicketCategory,
    TicketPriority,
    TicketStatus,
)
from app.models.sla import SLAConfiguration
from app.models.ai_resolution import (
    ResolutionRecommendation,
    KnowledgeDocument,
    RecommendationStatus,
)
from app.models.notification import Notification

__all__ = [
    "Base",
    "User",
    "UserRole",
    "Ticket",
    "TicketComment",
    "TicketHistory",
    "Assignment",
    "TicketCategory",
    "TicketPriority",
    "TicketStatus",
    "SLAConfiguration",
    "ResolutionRecommendation",
    "KnowledgeDocument",
    "RecommendationStatus",
    "Notification",
]

