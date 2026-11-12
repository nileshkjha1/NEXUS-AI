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

### TD-005: Dual-Dialect Database Support (PostgreSQL & SQLite)
- **Decision**: Implemented dialect-agnostic SQLAlchemy configurations with automatic fallback to SQLite for zero-setup local developer onboarding and rapid testing, while full PostgreSQL connection string is switchable via `DATABASE_URL`.
- **Rationale**: Enables beginners to start immediately without configuring a local PostgreSQL service, while maintaining 100% production compatibility with PostgreSQL for Docker and cloud deployments.

### TD-006: Direct Bcrypt and PyJWT for Authentication
- **Decision**: Used `bcrypt` directly alongside `pyjwt` rather than legacy `passlib`.
- **Rationale**: Passlib has known unmaintained compatibility issues with Python 3.12 and bcrypt 4.x. Direct `bcrypt` and `pyjwt` are actively maintained, lightweight, and standard enterprise practice.

### TD-007: Granular Audit History & Role-Based Access Control
- **Decision**: Created dedicated `TicketHistory` and `Assignment` entities triggered whenever ticket state, priority, category, or assignment changes. Also implemented visibility tiers (e.g. internal comments hidden from regular Employees).
- **Rationale**: Fulfills enterprise ITSM compliance requirements, preserves accountability, and mirrors enterprise platforms like Jira and ServiceNow.

### TD-008: React 18 + Vite SPA Architecture with Proxy Middleware
- **Decision**: Built the frontend using React 18 and Vite with a reverse-proxy forwarding `/api` calls directly to the FastAPI server running on port 8000.
- **Rationale**: Eliminates Cross-Origin Resource Sharing (CORS) development issues, enables lightning-fast Hot Module Replacement (HMR), and yields highly optimized production bundles.

### TD-009: In-Memory SQLite Pytest Isolation Fixture
- **Decision**: Added `backend/tests/conftest.py` with static in-memory SQLite (`sqlite:///:memory:`) and FastAPI dependency overrides for `get_db`.
- **Rationale**: Guarantees that automated backend test suites run completely isolated from developer database state, preventing test flakes and ensuring 100% repeatable execution.

### TD-010: TF-IDF & Balanced Logistic Regression for Incident Classification
- **Decision**: Implemented scikit-learn Pipeline with `TfidfVectorizer(ngram_range=(1,2), sublinear_tf=True)` and `LogisticRegression(class_weight='balanced')` for category classification and priority prediction.
- **Rationale**: High inference speed (<10ms per ticket), deterministic behavior, explainable feature weights, low memory footprint, and demonstrated 92.07% category accuracy on 820 labeled incidents.

### TD-011: Text Preprocessing & Non-Destructive Technical Filtering
- **Decision**: Tailored `clean_text` to preserve technical identifiers (e.g. replacing raw IP addresses with an `ipaddress` token, converting URLs to generic tokens) while removing conversational filler and punctuation.
- **Rationale**: Prevents overfitting to specific server IP addresses or unique URLs while maximizing semantic generalization across IT infrastructure domains.

### TD-012: FAISS IndexFlatIP Cosine Vector Search & Dense Projection
- **Decision**: Used `faiss-cpu` with normalized 128-dimensional dense vectors indexed via `faiss.IndexFlatIP`.
- **Rationale**: Inner product over $L_2$-normalized vectors is mathematically identical to exact cosine similarity, providing sub-millisecond retrieval across the troubleshooting SOP corpus without requiring GPU resources.

### TD-013: Resilient LLM Provider Abstraction with Offline Fallback
- **Decision**: Abstracted LLM resolution generation behind `BaseLLMProvider`, integrating Google Gemini when `GEMINI_API_KEY` is present, and gracefully falling back to `RetrievalFallbackProvider` when offline.
- **Rationale**: Satisfies enterprise reliability requirements; the platform remains 100% usable for developers without requiring paid API credits, and prevents ungrounded hallucinations by strictly citing retrieved documents.

### TD-014: Real-Time SLA Engine & Granular Risk Categorization
- **Decision**: Implemented dynamic SLA computation evaluating active tickets against configured resolution deadlines (Critical: 4h, High: 8h, Medium: 24h, Low: 48h) with 3 real-time states: `On Track`, `At Risk` (< 2h remaining), and `Breached`.
- **Rationale**: Provides IT managers with actionable foresight rather than retrospective alerts, allowing teams to intervene before SLA violations incur contractual or operational penalties.

### TD-015: Dual-Channel Notification Engine with Event Triggers
- **Decision**: Created an event-driven notification architecture persisting alerts directly to the database for real-time frontend in-app polling, accompanied by an SMTP email dispatcher that switches automatically to structured mock console logging when SMTP is offline.
- **Rationale**: Guarantees zero runtime errors for developers testing locally without an SMTP server while preserving an enterprise-ready pipeline for production environments (SendGrid, AWS SES, or corporate SMTP).

