from fastapi import APIRouter
from app.api.routes.auth import router as auth_router
from app.api.routes.tickets import router as tickets_router
from app.api.routes.users import router as users_router
from app.api.routes.ml import router as ml_router
from app.api.routes.ai import router as ai_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.notifications import router as notifications_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(tickets_router)
api_router.include_router(users_router)
api_router.include_router(ml_router)
api_router.include_router(ai_router)
api_router.include_router(analytics_router)
api_router.include_router(notifications_router)
