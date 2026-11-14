from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.session import engine, Base
from app.api.api import api_router
# Import models to ensure they are registered with Base.metadata
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist on application startup
    Base.metadata.create_all(bind=engine)
    # Seed default SLA and demo users if database is empty
    try:
        from app.database.seed import seed_database
        seed_database()
    except Exception as e:
        print(f"[STARTUP] Seeder note: {e}")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "NEXUS AI — Enterprise AI-Powered IT Service Management & "
        "Automated Incident Resolution Platform API."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
allow_all = "*" in settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else settings.cors_origins,
    allow_origin_regex=None if allow_all else settings.ALLOWED_ORIGIN_REGEX,
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler to ensure that unexpected 500 errors
    return proper CORS headers so the frontend receives a readable JSON error
    instead of an opaque browser CORS preflight/header failure.
    """
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred.",
            "error": str(exc) if settings.DEBUG else None,
        },
        headers={
            "Access-Control-Allow-Origin": origin if origin != "*" else "*",
            "Access-Control-Allow-Credentials": "true" if origin != "*" else "false",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        },
    )

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["System"])
def read_root():
    """
    Root endpoint providing general platform metadata and documentation links.
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "status": "online",
        "description": "Enterprise AI-Powered IT Service Management & Automated Incident Resolution Platform",
        "documentation": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health", tags=["System"])
@app.get(f"{settings.API_V1_STR}/health", tags=["System"])
def health_check():
    """
    Health check endpoint for container probes, uptime monitoring, and SLA verification.
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
