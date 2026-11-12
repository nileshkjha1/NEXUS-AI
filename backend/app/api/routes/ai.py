import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user, require_roles
from app.models.user import User, UserRole
from app.models.ai_resolution import ResolutionRecommendation, RecommendationStatus
from app.models.ticket import Ticket, TicketStatus
from app.ai.rag import get_rag_engine

router = APIRouter(prefix="/ai", tags=["AI Resolution Assistant & RAG"])


class ReviewPayload(BaseModel):
    status: RecommendationStatus = Field(..., description="Approved or Rejected")
    review_notes: Optional[str] = Field(None, description="Technician review feedback")
    apply_to_ticket: bool = Field(False, description="Whether to copy recommendation into ticket resolution notes")


@router.post("/recommend/{ticket_id}")
def generate_recommendation(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Generate an AI-assisted resolution recommendation using FAISS RAG pipeline.
    Accessible to Employees, Agents, and Administrators.
    """
    rag = get_rag_engine()
    try:
        recommendation = rag.generate_resolution(ticket_id=ticket_id, db=db)
        return recommendation
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resolution generation failed: {str(e)}",
        )


@router.get("/recommendations/{ticket_id}")
def get_recommendations_for_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve stored resolution recommendations for a ticket.
    """
    recs = (
        db.query(ResolutionRecommendation)
        .filter(ResolutionRecommendation.ticket_id == ticket_id)
        .order_by(ResolutionRecommendation.created_at.desc())
        .all()
    )

    formatted = []
    for r in recs:
        sources = []
        if r.supporting_sources:
            try:
                sources = json.loads(r.supporting_sources)
            except Exception:
                sources = [{"raw": r.supporting_sources}]

        formatted.append({
            "id": r.id,
            "ticket_id": r.ticket_id,
            "summary": r.summary,
            "probable_cause": r.probable_cause,
            "recommended_steps": [s for s in (r.recommended_steps or "").split("\n") if s],
            "confidence_score": r.confidence_score,
            "supporting_sources": sources,
            "status": r.status.value,
            "review_notes": r.review_notes,
            "reviewed_by_id": r.reviewed_by_id,
            "created_at": r.created_at,
        })
    return formatted


@router.post("/review/{recommendation_id}")
def review_recommendation(
    recommendation_id: int,
    payload: ReviewPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.IT_SUPPORT, UserRole.ADMIN])),
) -> Any:
    """
    Approve or reject an AI resolution proposal (Human-in-the-loop requirement).
    """
    rec = db.query(ResolutionRecommendation).filter(ResolutionRecommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation #{recommendation_id} not found.",
        )

    rec.status = payload.status
    rec.reviewed_by_id = current_user.id
    rec.review_notes = payload.review_notes

    # If approved and technician opted to apply to ticket:
    if payload.status == RecommendationStatus.APPROVED and payload.apply_to_ticket:
        ticket = db.query(Ticket).filter(Ticket.id == rec.ticket_id).first()
        if ticket:
            ticket.resolution_notes = f"AI Resolution (Approved by {current_user.full_name}):\n{rec.recommended_steps}"
            if payload.review_notes:
                ticket.resolution_notes += f"\nReview Notes: {payload.review_notes}"

    db.commit()
    db.refresh(rec)
    return {
        "message": f"Recommendation successfully marked as {payload.status.value}.",
        "recommendation_id": rec.id,
        "status": rec.status.value,
    }


@router.get("/similar-incidents/{ticket_id}")
def get_similar_incidents(
    ticket_id: int,
    top_k: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Semantic similarity search identifying similar historical resolved incidents (Feature E).
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    rag = get_rag_engine()
    query_text = f"{ticket.title} {ticket.description}"
    matches = rag.find_similar_incidents(query_text=query_text, db=db, top_k=top_k)
    return matches


@router.get("/knowledge")
def search_knowledge_base(
    q: str = Query(..., min_length=2, description="Search query"),
    top_k: int = Query(3, ge=1, le=10),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Vector search the knowledge base using FAISS.
    """
    rag = get_rag_engine()
    return rag.search_knowledge(query=q, top_k=top_k)
