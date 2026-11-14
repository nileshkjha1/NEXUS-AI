# NEXUS AI
### AI-Powered IT Service Management & Intelligent Incident Resolution

<p align="center">
  <strong>Turn IT incidents into actionable, trackable, AI-assisted resolutions.</strong>
</p>

<p align="center">
  <a href="https://nexus-ai-khaki-kappa.vercel.app"><strong>Live Application</strong></a> ·
  <a href="https://nexus-ai-backend-ze3p.onrender.com/docs"><strong>API Documentation</strong></a> ·
  <a href="https://github.com/nileshkjha1/NEXUS-AI"><strong>GitHub Repository</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.12">
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License">
</p>

NEXUS AI is a full-stack **IT Service Management (ITSM)** platform for submitting, classifying, assigning, investigating, and resolving IT incidents. It combines a React frontend, FastAPI backend, PostgreSQL persistence, machine-learning-based triage, semantic knowledge retrieval, and an AI-assisted resolution workflow with human approval.

> **Live demo:** The frontend and backend are deployed separately. The first request to the Render free web service may take longer after a period of inactivity.

## Live Deployment

| Component | Link | Hosting |
|---|---|---|
| Web application | [https://nexus-ai-khaki-kappa.vercel.app](https://nexus-ai-khaki-kappa.vercel.app) | Vercel |
| Backend API | [https://nexus-ai-backend-ze3p.onrender.com](https://nexus-ai-backend-ze3p.onrender.com) | Render |
| Interactive API documentation | [https://nexus-ai-backend-ze3p.onrender.com/docs](https://nexus-ai-backend-ze3p.onrender.com/docs) | Render |
| Source code | [GitHub repository](https://github.com/nileshkjha1/NEXUS-AI) | GitHub |

## At a Glance

- **Three role types:** Employee, IT Support Agent, and Administrator.
- **Incident lifecycle:** Submit, classify, assign, investigate, resolve, and review.
- **ML-assisted triage:** Predicts incident category and priority from the incident description.
- **Knowledge retrieval:** Uses FAISS similarity search to retrieve relevant SOPs and related incident knowledge.
- **Human oversight:** AI-generated resolution suggestions remain subject to agent review.
- **Operational visibility:** SLA status, incident analytics, MTTR, notifications, and audit history.

## Core Incident Workflow

The following illustrates the intended end-to-end workflow supported by the platform:

```mermaid
flowchart TD
    A["Employee submits an incident"] --> B["Backend validates request"]
    B --> C["ML model predicts category and priority"]
    C --> D["Incident is stored and SLA is calculated"]
    D --> E["Agent reviews and takes ownership"]
    E --> F["AI assistant retrieves relevant SOPs and similar incidents"]
    F --> G["Resolution recommendation is prepared"]
    G --> HAgent review
    H -->|Approve / use recommendation| I["Agent applies resolution"]
    H -->|Reject / revise| J["Agent investigates or edits recommendation"]
    J --> E
    I --> K["Incident status and history are updated"]
    K --> L["Analytics, SLA metrics and audit trail are updated"]
```

## Application Links & Environments

| Environment | Component | URL |
|---|---|---|
| Production | Frontend | [https://nexus-ai-khaki-kappa.vercel.app](https://nexus-ai-khaki-kappa.vercel.app) |
| Production | Backend API | [https://nexus-ai-backend-ze3p.onrender.com](https://nexus-ai-backend-ze3p.onrender.com) |
| Production | Swagger / OpenAPI UI | [https://nexus-ai-backend-ze3p.onrender.com/docs](https://nexus-ai-backend-ze3p.onrender.com/docs) |
| Local development | Vite frontend | `http://localhost:5173` |
| Local development | FastAPI backend | `http://127.0.0.1:8000` |
| Local development | API documentation | `http://127.0.0.1:8000/docs` |
| Local Docker | Unified application | `http://localhost` |

---

## Table of Contents

- [1. Problem Statement & Solution](#1-problem-statement--solution)
- [2. End-to-End Workflow](#2-end-to-end-workflow)
- [2. End-to-End Workflow](#end-to-end-workflow)
- [3. System Architecture](#2-system-architecture)
- [3. Key Platform Capabilities](#3-key-platform-capabilities)
- [4. Database Design (Entity-Relationship)](#4-database-design-entity-relationship)
- [5. Machine Learning Pipeline & Real Evaluation Metrics](#5-machine-learning-pipeline--real-evaluation-metrics)
- [6. AI Resolution Assistant & Vector RAG Pipeline](#6-ai-resolution-assistant--vector-rag-pipeline)
- [7. Technology Stack](#7-technology-stack)
- [8. Quickstart Guide (Local Development)](#8-quickstart-guide-local-development)
  - [Option A: Docker Compose (1-Command Launch)](#option-a-docker-compose-1-command-launch)
  - [Option B: Local Setup (Windows PowerShell)](#option-b-local-setup-windows-powershell)
- [9. Public Cloud Deployment Guide (Vercel + Render + PostgreSQL)](#9-public-cloud-deployment-guide-vercel--render--postgresql)
- [10. Seeded Default Accounts](#10-seeded-default-accounts)
- [11. REST API Specification Summary](#11-rest-api-specification-summary)
- [12. Technical Decisions & Trade-Offs](#12-technical-decisions--trade-offs)
- [13. Interview Preparation & Resume Highlights](#13-interview-preparation--resume-highlights)

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

## End-to-End Workflow

1. **Incident submission:** An employee signs in and submits an incident with a title and description.
2. **Automated triage:** The backend runs the configured ML pipeline to predict a category and priority.
3. **Persistence and SLA tracking:** The incident is stored in the relational database and its SLA target is calculated from its priority.
4. **Assignment and investigation:** An authorized agent reviews the incident and takes or receives ownership.
5. **Knowledge retrieval:** The AI resolution workflow searches relevant SOP content and similar historical incidents.
6. **Recommendation review:** The platform presents a structured recommendation and its supporting sources. The agent can review, revise, approve, or reject it.
7. **Resolution and governance:** The incident is updated through the normal workflow. Changes are recorded in ticket history/audit data and reflected in analytics.

The AI assistant is a decision-support feature: recommendations do not independently execute infrastructure changes or replace the authorized agent's review.

---

## 2. System Architecture

```mermaid
flowchart TB
    U["User's browser"] --> V["React 18 + Vite frontend"]
    V -->|HTTPS API requests| F["FastAPI application"]
    F --> AUTH["JWT authentication and RBAC"]
    F --> INC["Incident and workflow services"]
    F --> ML["ML triage service"]
    F --> RAG["AI / RAG resolution assistant"]
    F --> SLA["SLA and analytics services"]
    F --> AUD["Notifications and audit services"]
    INC <--> DB[("PostgreSQL database")]
    SLA <--> DB
    AUD <--> DB
    ML <--> MODEL[("Joblib model artifacts")]
    RAG <--> FAISS[("FAISS vector index")]
    RAG <--> DB
    subgraph Cloud["Current hosted deployment"]
      V
      F
      DB
    end
    subgraph Local["Optional local / Docker deployment"]
      N["Nginx reverse proxy"]
    end
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

## Project Structure

The repository is organized into separate frontend and backend applications, alongside deployment configuration, documentation, tests, and ML assets. The exact contents may evolve as the project is maintained.

```text
NEXUS-AI/
├── backend/              # FastAPI application, API routes and services
├── frontend/             # React + Vite user interface
├── data/                 # ML input data and processed artifacts
├── docs/                 # Project and API documentation
├── tests/                # Automated backend tests
├── .github/workflows/    # GitHub Actions CI workflows
├── docker-compose.yml    # Local multi-service orchestration
├── render.yaml           # Render deployment blueprint
├── README.md
└── LICENSE
```

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

## 8. Quickstart Guide (Local Development)

### Local Development vs. Production Deployment URLs

| Environment | Component | URL | Note |
|---|---|---|---|
| **Local Development** | React Frontend (Vite) | `http://localhost:5173` | Proxies `/api` to local FastAPI backend |
| **Local Development** | FastAPI Backend API | `http://127.0.0.1:8000` | Local API server running via Uvicorn |
| **Local Development** | Interactive API Docs | `http://127.0.0.1:8000/docs` | Swagger UI documentation |
| **Local Docker** | Unified Nginx Entrypoint | `http://localhost` | Single port 80 container reverse proxy |
| **Production Cloud** | Deployed Web App | `https://nexus-ai-khaki-kappa.vercel.app` | Hosted on Vercel |
| **Production Cloud** | Deployed Backend API | `https://nexus-ai-backend-ze3p.onrender.com` | Hosted on Render |
| **Production Cloud** | Production API Docs | `https://nexus-ai-backend-ze3p.onrender.com/docs` | Public Swagger documentation |

---

### Option A: Docker Compose (1-Command Launch)

Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running. In your terminal:

```powershell
# Clone the repository
git clone https://github.com/nileshkjha1/NEXUS-AI.git
cd NEXUS-AI

# Build and start all 3 services (PostgreSQL, FastAPI Backend, React/Nginx Frontend)
docker compose up -d --build
```

- **Frontend Application**: `http://localhost`
- **Interactive Swagger API Docs**: `http://localhost/docs`
- **Backend Health Check**: `http://localhost/health`

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

- **Frontend URL**: `http://localhost:5173`
- **Backend API**: `http://127.0.0.1:8000`

---

## 9. Public Cloud Deployment Guide (Vercel + Render + PostgreSQL)

NEXUS AI is currently deployed with **Render** hosting the Python backend and PostgreSQL database, and **Vercel** hosting the React frontend. The live URLs are listed at the top of this README. The steps below document how to reproduce the deployment.

### Step 1: Deploy PostgreSQL Database on Render
1. Log in to [Render](https://dashboard.render.com/) and click **New +** -> **PostgreSQL**.
2. Set **Name** to `nexus-ai-db` and **Database** to `nexus_db`.
3. Select the **Free** tier and click **Create Database**.
4. Once created, copy the **Internal Database URL** (for Render web service) or **External Database URL**.

### Step 2: Deploy FastAPI Backend on Render
1. In Render, click **New +** -> **Web Service** and connect your GitHub repository (`nileshkjha1/NEXUS-AI`).
2. Configure settings:
   - **Name**: `nexus-ai-backend` (your URL will be `https://nexus-ai-backend-ze3p.onrender.com`)
   - **Region**: Oregon (or matching your database)
   - **Branch**: `main`
   - **Root Directory**: leave blank (repository root)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
3. Under **Environment Variables**, add:
   - `APP_ENV`: `production`
   - `DEBUG`: `False`
   - `DATABASE_URL`: *(paste the connection string from Step 1)*
   - `SECRET_KEY`: *(enter a random 32+ character string)*
   - `JWT_SECRET_KEY`: *(enter a random 32+ character string)*
   - `ALLOWED_ORIGINS`: `http://localhost:5173,https://nexus-ai-khaki-kappa.vercel.app` *(use the deployed frontend URL `https://nexus-ai-khaki-kappa.vercel.app`)*
   - `LLM_PROVIDER`: `fallback` *(or `gemini` if providing `GEMINI_API_KEY`)*
4. Click **Deploy Web Service**.
   > *Note: Database schema creation and initial demo accounts (`admin@nexusai.com`, etc.) are automatically seeded on first launch!*

### Step 3: Deploy React Frontend on Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New...** -> **Project**.
2. Import your GitHub repository (`nileshkjha1/NEXUS-AI`).
3. In project setup:
   - **Root Directory**: Click edit and select `frontend`.
   - **Framework Preset**: `Vite` (detected automatically).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL`: `https://nexus-ai-backend-ze3p.onrender.com` *(use `https://nexus-ai-backend-ze3p.onrender.com` (without a trailing slash))*
5. Click **Deploy**. Vercel will build and assign your production domain: `https://nexus-ai-khaki-kappa.vercel.app`.

### Step 4: Finalize CORS Link
1. Go back to Render -> `nexus-ai-backend` -> **Environment**.
2. Ensure `ALLOWED_ORIGINS` includes your deployed Vercel frontend domain:
   ```
   https://nexus-ai-khaki-kappa.vercel.app,http://localhost:5173
   ```
3. Save changes. The deployed application is available at `https://nexus-ai-khaki-kappa.vercel.app` and its backend API is at `https://nexus-ai-backend-ze3p.onrender.com`.

---

## 10. Seeded Default Accounts

The database seeder automatically creates 3 testing accounts:

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@nexusai.com` | Use the in-app demo account option, if enabled | Full system control, user management, audit trail, global settings |
| **IT Support Agent** | `agent@nexusai.com` | Use the in-app demo account option, if enabled | Ticket triage, AI review, status updates, SLA reports |
| **Employee** | `employee@nexusai.com` | Use the in-app demo account option, if enabled | Create incidents, view personal tickets, add public comments |

> **Security:** Do not use seeded demo accounts for real data. Change or disable demo credentials before using the application with non-demo users. Never commit passwords, API keys, database URLs, JWT secrets, or `.env` files to GitHub.

---

## 11. REST API Specification Summary

> **Base URL**: `http://localhost:8000/api/v1` *(Local Development)* | `https://nexus-ai-backend-ze3p.onrender.com/api/v1` *(Production Cloud)*  
> **Interactive Docs**: `http://localhost:8000/docs` *(Local)* | `https://nexus-ai-backend-ze3p.onrender.com/docs` *(Production)*

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

## 12. Technical Decisions & Trade-Offs

Detailed technical justifications are tracked in [`TECHNICAL_DECISIONS.md`](TECHNICAL_DECISIONS.md):
- **TD-005: Dual-Dialect Support**: Allows developers to run tests on in-memory SQLite instantly without Docker, while seamlessly running PostgreSQL 16 in production.
- **TD-006: Direct Bcrypt + PyJWT**: Avoided unmaintained wrapper libraries like `passlib` to ensure full Python 3.12 compatibility.
- **TD-010: TF-IDF + Balanced Logistic Regression vs. Deep Learning**: Sub-10ms inference latency, zero GPU memory requirements, and explainable feature importances outperforming complex deep learning models for short incident descriptions.
- **TD-012: FAISS IndexFlatIP Cosine Search**: Inner products over unit-normalized dense vectors yield mathematically exact cosine similarity with zero external vector DB costs.
- **TD-013: Resilient LLM Fallback**: Guaranteed application uptime; the platform never crashes if an external LLM API quota is exhausted.
- **TD-016: Nginx Reverse Proxy Architecture**: Eliminates cross-origin (CORS) complexity by serving the React SPA and proxying `/api` requests on a single port.

---

## 13. Interview Preparation & Resume Highlights

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

## Security & Configuration

- Keep secrets in local environment files or hosting-provider environment settings.
- Keep `.env`, database dumps, private keys, and credentials out of version control.
- Configure production CORS with the exact frontend origin.
- Use strong, unique production secrets and rotate any credentials that may have been exposed.
- Treat the public demo as a demonstration environment; do not enter confidential or personal data.

## Development & Quality Checks

Before submitting changes, run the relevant checks for the part of the application you modified.

```bash
# Backend tests (run from the repository root, if pytest is installed)
pytest

# Frontend production build
cd frontend
npm install
npm run build
```

The repository's CI workflow should also be checked on GitHub after pushing changes. Report only test results that were actually run for the commit being reviewed.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-change`.
3. Make focused changes and add or update tests where appropriate.
4. Run the relevant checks locally.
5. Open a pull request describing the change and its verification.

## Known Deployment Considerations

- The Render free web service may spin down after inactivity, so its first request after an idle period can be slower.
- Free database plans can have storage, availability, and expiry limitations. Back up important database data independently of the source-code repository.
- A successful hosting deployment confirms that the service built and started; it does not by itself prove every workflow has been tested. Verify login, incident creation, assignment, AI recommendations, and persistence after deployment.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
