from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.ticket import TicketCategory, TicketPriority, TicketStatus
from app.schemas.user import UserResponse


class TicketBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    category: TicketCategory = TicketCategory.OTHER
    priority: TicketPriority = TicketPriority.MEDIUM


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None
    status: Optional[TicketStatus] = None
    resolution_notes: Optional[str] = None


class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    resolution_notes: Optional[str] = None


class TicketAssign(BaseModel):
    assigned_to_id: int
    notes: Optional[str] = None


class TicketCommentCreate(BaseModel):
    comment: str = Field(..., min_length=1)
    is_internal: bool = False


class TicketCommentResponse(BaseModel):
    id: int
    ticket_id: int
    user_id: int
    comment: str
    is_internal: bool
    created_at: datetime
    author: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


class TicketHistoryResponse(BaseModel):
    id: int
    ticket_id: int
    changed_by_id: int
    field_changed: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime
    changed_by: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


class TicketResponse(TicketBase):
    id: int
    ticket_number: str
    status: TicketStatus
    created_by_id: int
    assigned_to_id: Optional[int] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None
    assignee: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


class TicketDetailResponse(TicketResponse):
    comments: List[TicketCommentResponse] = []
    history: List[TicketHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)


class TicketListResponse(BaseModel):
    items: List[TicketResponse]
    total: int
    page: int
    size: int
    total_pages: int
