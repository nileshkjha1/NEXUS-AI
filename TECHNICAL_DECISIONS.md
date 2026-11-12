# NEXUS AI — Technical Decisions Log

### TD-001: Python Runtime & Virtual Environment
- **Decision**: Pinned to Python 3.12 (specifically 3.12.3 via `py -3.12`), with a dedicated virtual environment `.venv` located at project root.
- **Rationale**: Meets project requirements, ensures long-term compatibility with modern FastAPI, Pydantic v2, and ML libraries (scikit-learn, numpy). Root `.venv` allows root-level IDE detection and clean tool isolation.

### TD-002: Modular Clean Architecture for Backend
- **Decision**: Structured `backend/app` into layered domains: `api/routes`, `models` (SQLAlchemy ORM), `schemas` (Pydantic validation), `services` (business logic), `database` (session management), `ml` (tabular/classification pipelines), and `ai` (RAG & embeddings).
- **Rationale**: Prevents fat controllers, decouples business rules from HTTP handlers, and ensures scalability as ML/RAG pipelines grow.

### TD-003: Configuration via Pydantic Settings
- **Decision**: Used `pydantic-settings` with `.env` file loading and cached singleton `get_settings()`.
- **Rationale**: Enforces type safety for environment variables, prevents secret leakage, and simplifies mock configuration during testing.

### TD-004: Version-Tagged Health Check & Dual Endpoint Route
- **Decision**: Provided both `/health` and `/api/v1/health` with UTC timestamp and application status.
- **Rationale**: Supports standard Kubernetes/Docker liveness probes at `/health` while keeping API-namespaced observability consistent under `/api/v1`.
