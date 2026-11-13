# NEXUS AI — Enterprise AI-Powered IT Service Management & Automated Incident Resolution Platform

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![CI](https://img.shields.io/badge/GitHub_Actions-CI_Passing-2088FF?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> **NEXUS AI** is an enterprise-grade IT Service Management (ITSM) and automated incident resolution platform. It combines classical machine learning classification, dense vector semantic search (FAISS), Retrieval-Augmented Generation (RAG), and real-time SLA tracking into a unified, human-governed enterprise portal.

---

## Table of Contents

- [1. Problem Statement & Solution](#1-problem-statement--solution)
- [2. System Architecture](#2-system-architecture)
- [3. Key Platform Capabilities](#3-key-platform-capabilities)
- [4. Database Design (Entity-Relationship)](#4-database-design-entity-relationship)
- [5. Machine Learning Pipeline & Real Evaluation Metrics](#5-machine-learning-pipeline--real-evaluation-metrics)
- [6. AI Resolution Assistant & Vector RAG Pipeline](#6-ai-resolution-assistant--vector-rag-pipeline)
- [7. Technology Stack](#7-technology-stack)
- [8. Quickstart Guide](#8-quickstart-guide)
  - [Option A: Docker Compose (1-Command Launch)](#option-a-docker-compose-1-command-launch)
  - [Option B: Local Setup (Windows PowerShell)](#option-b-local-setup-windows-powershell)
- [9. Seeded Default Accounts](#9-seeded-default-accounts)
- [10. REST API Specification Summary](#10-rest-api-specification-summary)
- [11. Technical Decisions & Trade-Offs](#11-technical-decisions--trade-offs)
- [12. Interview Preparation & Resume Highlights](#12-interview-preparation--resume-highlights)

---

## 1. Problem Statement & Solution

### The Enterprise Challenge
Enterprise IT support organizations handle thousands of incoming tickets each month. Key operational bottlenecks include:
1. **Manual, Error-Prone Triage**: Routing tickets to the wrong team or assigning incorrect priorities causes costly delays.
2. **Repetitive Diagnoses**: Support agents spend hours re-diagnosing issues that have already been documented in standard operating procedures (SOPs) or resolved in historical tickets.
3. **SLA Penalties**: Lack of proactive alerting means high-priority tickets sit unaddressed until contractual breach thresholds are crossed.
4. **The Hallucination Danger in IT**: Directly hooking raw LLMs into production IT systems risks generating hallucinated, destructive commands (e.g., unintended restarts, dropped tables, or dangerous firewall changes).

### The NEXUS AI Solution
NEXUS AI introduces an end-to-end, multi-stage automated workflow:
- **Instant ML Triage**: Predicts incident category and SLA priority in <10ms upon submission.
- **Dense Vector RAG**: Converts incident descriptions into 128-dimensional dense semantic vectors and performs exact cosine similarity search over curated enterprise SOPs using FAISS.
- **Strict Human-in-the-Loop Guardrail**: AI recommendations remain isolated in a `Pending Review` state. IT Support Agents must explicitly **Approve** or **Reject** recommendations before any resolution notes are applied.
- **Live SLA & MTTR Analytics**: Calculates real-time countdown timers, identifies tickets at risk (<2h remaining), tracks Mean Time To Resolution (MTTR), and logs every field modification to an immutable governance audit trail.

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph PresentationTier["Presentation Tier (Client)"]
        Browser["Modern Web Browser"]
        SPA["React 18 + Vite SPA (Inter Typography & Lucide Icons)"]
        Browser --> SPA
    end

    subgraph IngressTier["Ingress & Proxy Tier"]
        Nginx["Nginx Alpine Reverse Proxy (:80)"]
        SPA -->|Static Bundle & API Requests| Nginx
    end

    subgraph AppTier["Application Tier (FastAPI :8000)"]
        Router["FastAPI Core Routing & Middleware"]
        AuthModule["JWT Security & Bcrypt Authentication"]
        TicketModule["Incident Management & Workflow Engine"]
        MLModule["Machine Learning Triage Engine"]
        RAGModule["AI & RAG Resolution Assistant"]
        SLAModule["Real-Time SLA & Compliance Engine"]
        NotifModule["Notification & SMTP Dispatcher"]
        AuditModule["Immutable Governance Audit Trail"]

        Router --> AuthModule
        Router --> TicketModule
        Router --> MLModule
        Router --> RAGModule
        Router --> SLAModule
        Router --> NotifModule
        Router --> AuditModule
    end

    Nginx -->|/api/v1/*| Router

    subgraph DataTier["Data & Vector Persistence Tier"]
        DB[("PostgreSQL 16 / SQLite Engine")]
        VectorDB[("FAISS Dense Vector Index")]
        MLModels[("Persisted Joblib Model Artifacts")]
    end

    TicketModule <--> DB
    AuditModule <--> DB
    NotifModule <--> DB
    SLAModule <--> DB
    MLModule <--> MLModels
    RAGModule <--> VectorDB
    RAGModule <--> DB
```

---

## 3. Key Platform Capabilities

| Capability | Description |
|---|---|
| **Role-Based Access Control (RBAC)** | Dedicated portal views and authorization boundaries for `Employee`, `IT Support Agent`, and `Administrator`. |
| **Automated ML Classification** | Automatically classifies incident category and predicts SLA priority upon ticket creation. |
| **Similar Incident Detection** | Performs semantic vector similarity matching against historical resolved incidents to suggest proven procedures. |
| **FAISS Vector Search & RAG** | Retrieves the Top-K most relevant Standard Operating Procedures without external network dependencies. |
| **LLM Provider Abstraction** | Pluggable interface supporting Google Gemini API with a zero-cost, offline fallback synthesizer that guarantees grounded citations. |
| **Human-in-the-Loop Review** | Full review interface allowing agents to inspect problem causes, edit remediation steps, and approve/reject AI suggestions. |
| **Real-Time SLA Monitoring** | 3-state SLA tracking (`On Track`, `At Risk`, `Breached`) with active overdue countdowns. |
| **Enterprise Analytics** | Dynamic dashboard showing MTTR, SLA compliance rates, category/priority volumes, and agent workload capacity. |
| **Governance Audit Trail** | Immutable log recording every field-level change (`old_value`, `new_value`, user, timestamp). |
| **Multi-Channel Notifications** | Real-time in-app notification dropdown with unread badge counter, paired with an SMTP email dispatcher. |

---

## 4. Database Design (Entity-Relationship)

```mermaid
erDiagram
    USERS ||--o{ TICKETS : "creates (created_by)"
    USERS ||--o{ TICKETS : "assigned to (assigned_to)"
    USERS ||--o{ TICKET_COMMENTS : "authors"
    USERS ||--o{ TICKET_HISTORY : "triggers change"
    USERS ||--o{ ASSIGNMENTS : "assigned to/by"
    USERS ||--o{ RESOLUTION_RECOMMENDATIONS : "reviews"
    USERS ||--o{ NOTIFICATIONS : "receives"

    TICKETS ||--o{ TICKET_COMMENTS : "has"
    TICKETS ||--o{ TICKET_HISTORY : "tracks audit trail"
    TICKETS ||--o{ ASSIGNMENTS : "receives assignments"
    TICKETS ||--o{ RESOLUTION_RECOMMENDATIONS : "has AI proposals"
    TICKETS ||--o{ NOTIFICATIONS : "references"

    USERS {
        int id PK
        string email UK
        string hashed_password
        string full_name
        enum role
        string department
        boolean is_active
        datetime created_at
    }

    TICKETS {
        int id PK
        string ticket_number UK
        string title
        text description
        enum category
        enum priority
        enum status
        int created_by_id FK
        int assigned_to_id FK
        text resolution_notes
        datetime resolved_at
        datetime due_date
        datetime created_at
    }

    TICKET_COMMENTS {
        int id PK
        int ticket_id FK
        int user_id FK
        text comment
        boolean is_internal
        datetime created_at
    }

    TICKET_HISTORY {
        int id PK
        int ticket_id FK
        int changed_by_id FK
        string field_changed
        text old_value
        text new_value
        datetime created_at
    }

    SLA_CONFIGURATIONS {
        int id PK
        enum priority UK
        int response_time_hours
        int resolution_time_hours
    }

    RESOLUTION_RECOMMENDATIONS {
        int id PK
        int ticket_id FK
        text summary
        text probable_cause
        text recommended_steps
        float confidence_score
        text supporting_sources
        enum status
        int reviewed_by_id FK
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        int ticket_id FK
        string title
        text message
        boolean is_read
        datetime created_at
    }
```

---

## 5. Machine Learning Pipeline & Real Evaluation Metrics

NEXUS AI does not rely on synthetic claims or fabricated accuracy figures. The machine learning pipeline was trained and evaluated on an 820-sample enterprise incident dataset (`data/raw/incidents.csv`) split into 80% training and 20% independent testing sets (`test_samples = 164`).

### Pipeline Architecture
- **Text Preprocessing**: Normalized tokenization, lowercasing, technical regex token preservation (preserving IP addresses as `ipaddress`, sanitizing URLs).
- **Feature Extraction**: `TfidfVectorizer(ngram_range=(1,2), sublinear_tf=True, min_df=2)`. Captures critical enterprise bigrams (e.g., "vpn tunnel", "connection pool", "memory leak").
- **Model Classifier**: Multi-class `LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)`.

### Verified Model Performance Metrics
*(Stored in `data/processed/model_metrics.json`)*

| Model Target | Accuracy | Precision (Weighted) | Recall (Weighted) | F1-Score (Weighted) | Macro F1 | Test Set Size |
|---|---|---|---|---|---|---|
| **Incident Category** | **92.07%** | **92.16%** | **92.07%** | **0.9191** | **0.9084** | 164 tickets |
| **Incident Priority** | **85.98%** | **86.35%** | **85.98%** | **0.8610** | **0.8524** | 164 tickets |

#### Breakdown by Category
- **Hardware**: 100.0% Recall, 0.966 F1
- **Database**: 100.0% Recall, 0.964 F1
- **Network**: 92.3% Recall, 0.923 F1
- **Security**: 92.6% Recall, 0.926 F1
- **Authentication**: 92.0% Recall, 0.902 F1
- **Application**: 76.0% Recall, 0.844 F1
- **Software**: 83.3% Recall, 0.833 F1

---

## 6. AI Resolution Assistant & Vector RAG Pipeline

```
[Incoming Incident Description]
               │
               ▼
   [Text Cleaning & Tokenizer]
               │
               ▼
 [128-d Dense Semantic Projection (L2 Normalized)]
               │
               ▼
 [FAISS IndexFlatIP Cosine Similarity Search]
               │
               ▼
 [Top-K Retrieved SOPs & Knowledge Documents]
               │
               ▼
 [LLM Provider Interface (Gemini API or Offline Fallback)]
               │
               ▼
 [Structured Recommendation: Summary, Cause, Steps, Citations]
               │
               ▼
 [Human-in-the-Loop: Agent Review -> Approved -> Ticket Resolved]
```

1. **Deterministic Dense Semantic Projection**: Generates 128-dimensional dense vectors using sublinear term hashing combined with an orthogonal projection matrix, unit-normalized ($L_2 = 1.0$).
2. **FAISS Vector Index**: Leverages `faiss.IndexFlatIP` to perform exact inner product search (which equals cosine similarity for normalized vectors) in <1 millisecond.
3. **Resilient LLM Provider**:
   - When `GEMINI_API_KEY` is present: Uses Google Gemini to generate natural language remediation walkthroughs.
   - When offline or unconfigured: Transparently falls back to `RetrievalFallbackProvider`, formatting the exact retrieved SOP without crashing or hallucinating.
4. **Zero Fabrication**: Every recommendation explicitly cites its supporting knowledge document (e.g., `SOP-NET-001: Corporate VPN & AnyConnect Troubleshooting`).

---

## 7. Technology Stack

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Vanilla CSS | Fast, modular Single Page Application with zero CSS framework bloat |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Uvicorn | High-throughput asynchronous REST API and business logic orchestration |
| **Data Layer** | PostgreSQL 16, SQLite, SQLAlchemy 2.0, Alembic | Dialect-agnostic relational persistence with automated schema migrations |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, Joblib | Instant incident category classification and SLA priority prediction |
| **Vector Search & AI** | FAISS (`faiss-cpu`), Google Gemini API | Dense vector indexing, cosine similarity retrieval, and grounded RAG synthesis |
| **Security & Auth** | Bcrypt, PyJWT, Python-Multipart | Salted password hashing, stateless JWT Bearer authorization, RBAC |
| **DevOps & Infra** | Docker, Docker Compose, Nginx, GitHub Actions | Multi-stage containerization, unified reverse proxy, and automated CI |

---

## 8. Quickstart Guide

### Option A: Docker Compose (1-Command Launch)

Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running. In your terminal:

```powershell
# Clone the repository
git clone https://github.com/your-username/nexus-ai.git
cd nexus-ai

# Build and start all 3 services (PostgreSQL, FastAPI Backend, React/Nginx Frontend)
docker compose up -d --build
```

- **Frontend Application**: [http://localhost](http://localhost)
- **Interactive Swagger API Docs**: [http://localhost/docs](http://localhost/docs)
- **Backend Health Check**: [http://localhost/health](http://localhost/health)

---

### Option B: Local Setup (Windows PowerShell)

#### 1. Backend Setup
```powershell
# Create and activate Python virtual environment
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt

# Run database migrations and seed default accounts
cd backend
python -m app.database.seed

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
In a new PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```

- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 9. Seeded Default Accounts

The database seeder automatically creates 3 testing accounts:

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@nexusai.com` | `Admin@123456` | Full system control, user management, audit trail, global settings |
| **IT Support Agent** | `agent@nexusai.com` | `Agent@123456` | Ticket triage, AI review, status updates, SLA reports |
| **Employee** | `employee@nexusai.com` | `Employee@123456` | Create incidents, view personal tickets, add public comments |

---

## 10. REST API Specification Summary

| Domain | Method | Endpoint | Description | Access |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT access token | Public |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new user account | Public |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Authenticated |
| **Incidents** | `GET` | `/api/v1/tickets` | List tickets with search, filters, pagination | Scoped by Role |
| **Incidents** | `POST` | `/api/v1/tickets` | Submit ticket (triggers automated ML triage) | Authenticated |
| **Incidents** | `GET` | `/api/v1/tickets/{id}` | Get incident details, comments, and history | Authenticated |
| **Incidents** | `PUT` | `/api/v1/tickets/{id}` | Update status, priority, or resolution notes | Support / Admin |
| **Incidents** | `POST` | `/api/v1/tickets/{id}/assign` | Assign incident to an IT support agent | Support / Admin |
| **ML Engine** | `POST` | `/api/v1/ml/triage` | Get predicted category and priority with confidence | Authenticated |
| **ML Engine** | `GET` | `/api/v1/ml/metrics` | Retrieve verified model accuracy and F1 scores | Authenticated |
| **AI / RAG** | `POST` | `/api/v1/ai/recommend/{id}` | Generate grounded RAG remediation proposal | Support / Admin |
| **AI / RAG** | `POST` | `/api/v1/ai/review/{id}` | Human review: Approve or Reject AI recommendation | Support / Admin |
| **AI / RAG** | `GET` | `/api/v1/ai/similar-incidents/{id}` | Search historically resolved cases via FAISS | Support / Admin |
| **Analytics** | `GET` | `/api/v1/analytics/overview` | Platform metrics, MTTR, category/priority volumes | Support / Admin |
| **Analytics** | `GET` | `/api/v1/analytics/sla` | SLA compliance percentage and breached tickets | Support / Admin |
| **Analytics** | `GET` | `/api/v1/analytics/audit-logs` | Immutable audit trail of system change logs | Admin only |
| **Notifs** | `GET` | `/api/v1/notifications` | Fetch user notifications and unread count | Authenticated |
| **Notifs** | `PATCH`| `/api/v1/notifications/{id}/read`| Mark individual notification as read | Authenticated |

---

## 11. Technical Decisions & Trade-Offs

Detailed technical justifications are tracked in [`TECHNICAL_DECISIONS.md`](file:///TECHNICAL_DECISIONS.md):
- **TD-005: Dual-Dialect Support**: Allows developers to run tests on in-memory SQLite instantly without Docker, while seamlessly running PostgreSQL 16 in production.
- **TD-006: Direct Bcrypt + PyJWT**: Avoided unmaintained wrapper libraries like `passlib` to ensure full Python 3.12 compatibility.
- **TD-010: TF-IDF + Balanced Logistic Regression vs. Deep Learning**: Sub-10ms inference latency, zero GPU memory requirements, and explainable feature importances outperforming complex deep learning models for short incident descriptions.
- **TD-012: FAISS IndexFlatIP Cosine Search**: Inner products over unit-normalized dense vectors yield mathematically exact cosine similarity with zero external vector DB costs.
- **TD-013: Resilient LLM Fallback**: Guaranteed application uptime; the platform never crashes if an external LLM API quota is exhausted.
- **TD-016: Nginx Reverse Proxy Architecture**: Eliminates cross-origin (CORS) complexity by serving the React SPA and proxying `/api` requests on a single port.

---

## 12. Interview Preparation & Resume Highlights

### Resume Bullet Points
- **Architected and built NEXUS AI**, an enterprise IT Service Management platform with Python 3.12, FastAPI, PostgreSQL, FAISS, and React, reducing incident triage time by automating category and priority assignment.
- **Engineered an ML triage pipeline** utilizing TF-IDF vectorization and balanced Logistic Regression, achieving **92.07% category classification accuracy** and **85.98% priority prediction accuracy** across 820 labeled enterprise tickets.
- **Integrated a Retrieval-Augmented Generation (RAG) assistant** with FAISS dense vector search and Google Gemini, providing grounded SOP remediation steps with a human-in-the-loop approval workflow.
- **Developed real-time SLA breach detection and analytics**, computing Mean Time To Resolution (MTTR), tracking compliance across priority tiers, and persisting an immutable audit trail for governance.
- **Containerized the platform with Docker Compose**, configuring an Nginx reverse proxy, multi-stage frontend build, and automated GitHub Actions CI running 38 Pytest unit and integration tests.

### Key Questions You Can Confidently Answer in Interviews
1. **Why use TF-IDF + Logistic Regression instead of fine-tuning a BERT or LLM model for triage?**
   > *Answer*: For enterprise ITSM triage, inference latency and resource efficiency are paramount. Our TF-IDF + Logistic Regression pipeline executes in <10ms with zero GPU requirement while achieving 92.07% accuracy. It avoids cold-start latency, is explainable, and can be retrained in seconds on standard CPU infrastructure.
2. **How do you prevent AI hallucinations from causing destructive system changes?**
   > *Answer*: Through a three-layer guardrail: First, the RAG prompt strictly bounds the LLM to cited enterprise SOPs. Second, our offline fallback guarantees grounded steps even if the LLM provider fails. Third, by architecture design, AI recommendations are never executed automatically; they require explicit human approval by an authorized IT Support Agent.
3. **How is data isolation handled in automated tests?**
   > *Answer*: We implemented an in-memory SQLite test fixture with `StaticPool` in `conftest.py`, overriding FastAPI's `get_db` dependency. This ensures all 38 unit and integration tests run 100% in memory, completely isolated from developer database state, executing in under 8 seconds.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

