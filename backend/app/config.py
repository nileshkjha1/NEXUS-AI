from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "NEXUS AI"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "dev-secret-key-nexus-ai-change-in-production-123456789"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    ALLOWED_ORIGIN_REGEX: Optional[str] = r"^https:\/\/.*\.vercel\.app$"

    # Database Configuration (PostgreSQL in production/Docker, SQLite for zero-setup local dev & testing)
    DATABASE_URL: str = "sqlite:///./nexus_ai.db"

    # JWT Authentication Configuration
    JWT_SECRET_KEY: str = "dev-jwt-secret-key-nexus-ai-change-in-production-123456789"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI & RAG Configuration
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    LLM_PROVIDER: str = "auto"  # 'auto', 'gemini', 'openai', 'fallback'
    RAG_TOP_K: int = 3

    # Email & Notification Configuration
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM: str = "nexus-notifications@company.com"
    EMAILS_ENABLED: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["http://localhost:5173", "http://127.0.0.1:5173"]
        raw = self.ALLOWED_ORIGINS.strip()
        # Handle JSON array string format e.g. ["https://...", "http://..."]
        if raw.startswith("[") and raw.endswith("]"):
            import json
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(o).strip().strip("'\"").rstrip("/") for o in parsed if str(o).strip()]
            except Exception:
                raw = raw[1:-1]

        origins: List[str] = []
        for origin in raw.split(","):
            cleaned = origin.strip().strip("'\"[]").rstrip("/")
            if cleaned:
                origins.append(cleaned)
        return origins or ["http://localhost:5173", "http://127.0.0.1:5173"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
