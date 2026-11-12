from typing import Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user, require_roles
from app.models.user import User, UserRole
from app.services import analytics_service, sla_service

router = APIRouter(prefix="/analytics", tags=["ITSM Analytics & Reporting"])


@router.get("/overview")
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.IT_SUPPORT, UserRole.ADMIN])),
) -> Any:
    """
    Retrieve live enterprise ITSM metrics, category distributions, agent workload, and SLA adherence.
    """
    return analytics_service.get_platform_analytics(db=db)


@router.get("/sla")
def get_sla_report_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.IT_SUPPORT, UserRole.ADMIN])),
) -> Any:
    """
    Retrieve detailed SLA compliance report and list of currently breached tickets.
    """
    return sla_service.get_sla_report(db=db)


@router.get("/audit-logs")
def get_audit_trail_endpoint(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
) -> Any:
    """
    Retrieve global system audit logs tracking changes to ticket fields (Administrator only).
    """
    return analytics_service.get_audit_trail(db=db, limit=limit)
