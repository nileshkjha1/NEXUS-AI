# NEXUS AI — Production Containerization & Deployment Guide

## 1. Architecture Overview

NEXUS AI is fully containerized using a decoupled multi-container architecture orchestrated via Docker Compose:

```
                  ┌────────────────────────────────────────┐
                  │          Host / User Traffic           │
                  │             (Port 80 HTTP)             │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │             nexus_frontend             │
                  │       (Nginx Alpine Reverse Proxy)     │
                  ├────────────────────────────────────────┤
                  │  /          -> React Static Assets     │
                  │  /assets    -> Cached Immutable JS/CSS │
                  │  /api/v1/*  -> Proxy to Backend:8000   │
                  │  /docs      -> Proxy to Swagger Docs   │
                  └───────────────────┬────────────────────┘
                                      │ (internal Docker network)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │             nexus_backend              │
                  │        (FastAPI + Python 3.12)         │
                  ├────────────────────────────────────────┤
                  │  - Scikit-learn ML Inference Engine    │
                  │  - FAISS Cosine Vector RAG Search      │
                  │  - JWT Authentication & RBAC           │
                  │  - SLA Compliance & Notifications      │
                  └───────────────────┬────────────────────┘
                                      │ (internal Docker network)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │                nexus_db                │
                  │        (PostgreSQL 16 Alpine)          │
                  ├────────────────────────────────────────┤
                  │  - Persistent Volume: nexus_pgdata     │
                  │  - Healthchecked via pg_isready        │
                  └────────────────────────────────────────┘
```

---

## 2. Docker Compose Quickstart

### Prerequisites
- Docker Engine 24+ and Docker Compose v2+ (or Docker Desktop)
- Git

### 1-Command Production Launch
From the project root:

```bash
docker compose up -d --build
```

### Checking Container Status
```bash
docker compose ps
```

Expected output:
```
NAME             IMAGE                  COMMAND                  SERVICE      STATUS                 PORTS
nexus_db         postgres:16-alpine     "docker-entrypoint.s…"   db           Up (healthy)           0.0.0.0:5432->5432/tcp
nexus_backend    nexus-ai-backend       "sh -c 'python -m ap…"   backend      Up (healthy)           0.0.0.0:8000->8000/tcp
nexus_frontend   nexus-ai-frontend      "nginx -g 'daemon of…"   frontend     Up (healthy)           0.0.0.0:80->80/tcp
```

### Accessing the Platform
- **React Frontend**: http://localhost
- **Swagger Interactive API Documentation**: http://localhost/docs
- **Liveness Health Check**: http://localhost/health

### Default Seeded Accounts
| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@nexusai.com` | `Admin@123456` |
| **IT Support Agent** | `agent@nexusai.com` | `Agent@123456` |
| **Employee** | `employee@nexusai.com` | `Employee@123456` |

---

## 3. Environment Variables Reference

Create a root `.env` or set environment variables in your cloud provider:

| Variable | Default (Dev) | Production Description |
|---|---|---|
| `POSTGRES_USER` | `nexus` | PostgreSQL master database user |
| `POSTGRES_PASSWORD` | `nexus_password` | High-entropy production database password |
| `POSTGRES_DB` | `nexus_db` | Primary relational database name |
| `POSTGRES_PORT` | `5432` | Exposed host database port |
| `SECRET_KEY` | *(dev key)* | Secret key for session security |
| `JWT_SECRET_KEY` | *(dev key)* | High-entropy key used to sign JWT access tokens |
| `GEMINI_API_KEY` | *(optional)* | Google Gemini API key for live RAG generation |
| `LLM_PROVIDER` | `auto` | `auto`, `gemini`, or `fallback` (offline) |
| `EMAILS_ENABLED` | `False` | Toggle active SMTP email dispatch |
| `SMTP_HOST` | *(none)* | Production SMTP host (e.g., `smtp.sendgrid.net`) |
| `SMTP_PORT` | `587` | Standard TLS SMTP port |
| `SMTP_USER` | *(none)* | SMTP authentication username |
| `SMTP_PASSWORD` | *(none)* | SMTP authentication secret/key |

---

## 4. AWS Cloud Deployment Options

### Option A: AWS App Runner (Fastest & Fully Managed)
1. Push `backend/Dockerfile` and `frontend/Dockerfile` to Amazon Elastic Container Registry (ECR).
2. Provision an Amazon RDS PostgreSQL 16 instance in a private VPC subnet.
3. Deploy two App Runner services:
   - Backend service connected to RDS via VPC connector.
   - Frontend service with environment variable pointing to the backend App Runner URL.

### Option B: AWS Elastic Container Service (ECS) with AWS Fargate
1. Create an ECS Cluster using the serverless Fargate launch type.
2. Define a multi-container Task Definition:
   - Container 1: `frontend` (Nginx, Port 80)
   - Container 2: `backend` (FastAPI, Port 8000)
3. Attach an AWS Application Load Balancer (ALB) with SSL/TLS terminating on port 443.
4. Use Amazon Aurora Serverless PostgreSQL or Amazon RDS PostgreSQL as the database.
5. Store sensitive secrets (`JWT_SECRET_KEY`, `POSTGRES_PASSWORD`, `GEMINI_API_KEY`) in AWS Secrets Manager or AWS Systems Manager (SSM) Parameter Store.

### Option C: AWS EC2 (Single-Instance VM with Docker Compose)
1. Launch an `Ubuntu 24.04 LTS` EC2 instance (`t3.medium` or larger recommended).
2. Attach an Elastic IP and configure Security Group (Inbound ports: 22, 80, 443).
3. Install Docker & Docker Compose:
   ```bash
   sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
   sudo usermod -aG docker ubuntu
   ```
4. Clone the repository and execute:
   ```bash
   docker compose up -d --build
   ```

---

## 5. Automated CI/CD Pipeline (GitHub Actions)

Located at [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml), every push and pull request triggers three parallel jobs:

1. **`backend-tests`**:
   - Boots Ubuntu Linux container with Python 3.12.
   - Installs system dependencies (`libgomp1` for FAISS vector search).
   - Validates Python syntax using `python -m compileall`.
   - Runs full Pytest suite with 38 unit and integration tests.
2. **`frontend-build`**:
   - Boots Node 20 environment.
   - Runs `npm ci` and verifies that Vite builds the React bundle with 0 errors.
3. **`docker-validation`**:
   - Executes `docker compose config` to guarantee zero syntax or indentation errors in Compose definitions.
