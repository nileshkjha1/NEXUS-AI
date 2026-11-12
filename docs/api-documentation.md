# NEXUS AI — REST API Documentation

Base URL: `http://localhost:8000/api/v1` (or `http://localhost/api/v1` via Docker Nginx)

Interactive Swagger UI: `http://localhost:8000/docs`  
OpenAPI Specification: `http://localhost:8000/openapi.json`

---

## 1. Authentication & Security

All protected endpoints require an `Authorization` header containing a valid Bearer token:
```http
Authorization: Bearer <access_token>
```

Tokens are signed using `HS256` with a configurable expiration window (default: 24 hours).

---

## 2. API Endpoints Catalog

### 2.1 Authentication (`/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user account | Public |
| `POST` | `/auth/login` | Authenticate using JSON credentials (`email`, `password`) | Public |
| `POST` | `/auth/login/access-token` | OAuth2 form-compatible login (`username`, `password`) | Public |
| `GET` | `/auth/me` | Retrieve profile of currently authenticated user | Authenticated |

#### Request Example: `POST /auth/login`
```json
{
  "email": "admin@nexusai.com",
  "password": "Admin@123456"
}
```

#### Response Example (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@nexusai.com",
    "full_name": "System Administrator",
    "role": "Administrator",
    "department": "IT Operations",
    "is_active": true
  }
}
```

---

### 2.2 Incident Management (`/tickets`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/tickets` | List incidents with search, filters (`status`, `priority`, `category`), and pagination | Authenticated (scoped by role) |
| `POST` | `/tickets` | Create a new incident ticket (triggers automated ML triage) | Authenticated |
| `GET` | `/tickets/{id}` | Retrieve incident details including comments, history, and assignments | Authenticated |
| `PUT` | `/tickets/{id}` | Update incident fields (status, priority, category, resolution notes) | IT Support / Admin |
| `DELETE` | `/tickets/{id}` | Delete an incident ticket | Admin only |
| `POST` | `/tickets/{id}/assign` | Assign incident to an IT Support Agent | IT Support / Admin |
| `POST` | `/tickets/{id}/comments` | Add a public or internal work note comment | Authenticated |

#### Request Example: `POST /tickets`
```json
{
  "title": "VPN connection drops repeatedly when running heavy queries",
  "description": "Any time a report executes against the data warehouse, Cisco AnyConnect disconnects.",
  "category": "Other",
  "priority": "Medium"
}
```
*Note: If category is submitted as `Other`, the ML triage engine classifies the incident automatically.*

---

### 2.3 Machine Learning Engine (`/ml`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/ml/predict/category` | Predict incident category and return probability distribution | Authenticated |
| `POST` | `/ml/predict/priority` | Predict incident priority and return probability distribution | Authenticated |
| `POST` | `/ml/triage` | Simultaneously predict category and priority with confidence scores | Authenticated |
| `GET` | `/ml/metrics` | Retrieve verified model evaluation metrics (Accuracy, Precision, Recall, F1) | Authenticated |

#### Response Example: `POST /ml/triage`
```json
{
  "category": {
    "predicted_category": "Network",
    "confidence": 0.892,
    "probabilities": {
      "Network": 0.892,
      "Application": 0.045,
      "Database": 0.031,
      "Security": 0.018,
      "Hardware": 0.007,
      "Software": 0.005,
      "Authentication": 0.002
    }
  },
  "priority": {
    "predicted_priority": "High",
    "confidence": 0.814,
    "probabilities": {
      "High": 0.814,
      "Medium": 0.123,
      "Critical": 0.045,
      "Low": 0.018
    }
  }
}
```

---

### 2.4 AI Resolution Assistant & RAG (`/ai`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/ai/recommend/{ticket_id}` | Generate RAG remediation recommendation for an incident | IT Support / Admin |
| `GET` | `/ai/recommendations/{ticket_id}` | Retrieve all AI recommendations for an incident | Authenticated |
| `POST` | `/ai/review/{recommendation_id}` | Approve or Reject an AI recommendation (with optional ticket apply) | IT Support / Admin |
| `GET` | `/ai/similar-incidents/{ticket_id}` | Find historical resolved incidents using FAISS semantic similarity | IT Support / Admin |
| `GET` | `/ai/knowledge` | Search troubleshooting Standard Operating Procedures directly | Authenticated |

#### Response Example: `POST /ai/recommend/{ticket_id}`
```json
{
  "id": 1,
  "ticket_id": 1001,
  "summary": "Database connection pool exhaustion caused by high concurrent query load.",
  "probable_cause": "Max connection limit exceeded on primary PostgreSQL cluster.",
  "recommended_steps": "1. Inspect active connection count with pg_stat_activity.\n2. Terminate idle connection leases.\n3. Increase PgBouncer pool ceiling.\n4. Restart connection pooling daemon.",
  "confidence_score": 0.88,
  "supporting_sources": "SOP-DB-001: PostgreSQL Connection Pool Tuning & Deadlock Remediation",
  "escalation_recommendation": "Escalate to DBA Lead if connection spikes exceed 500 ops/sec.",
  "status": "pending_review"
}
```

---

### 2.5 Enterprise Analytics & SLA Monitoring (`/analytics`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/analytics/overview` | Platform KPI metrics, MTTR, category/priority breakdowns, agent workload | IT Support / Admin |
| `GET` | `/analytics/sla` | Global SLA compliance percentage, at-risk and breached incident list | IT Support / Admin |
| `GET` | `/analytics/audit-logs` | Immutable audit trail tracking field-level changes across tickets | Admin only |

#### Response Example: `GET /analytics/sla`
```json
{
  "total_tickets": 25,
  "compliant_count": 24,
  "breached_count": 1,
  "at_risk_count": 2,
  "compliance_rate": 96.0,
  "breached_tickets": [
    {
      "id": 4,
      "ticket_number": "INC-1004",
      "title": "Core router rebooted unexpectedly",
      "priority": "Critical",
      "status": "Open",
      "hours_overdue": 1.5
    }
  ]
}
```

---

### 2.6 Notifications (`/notifications`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/notifications` | Retrieve user notification feed with unread counter | Authenticated |
| `PATCH` | `/notifications/{id}/read` | Mark an individual notification as read | Authenticated |
| `POST` | `/notifications/mark-all-read` | Mark all unread notifications as read for current user | Authenticated |

---

### 2.7 User Management (`/users`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/users` | List platform users with optional `role` filtering | Authenticated |
| `GET` | `/users/{id}` | Get specific user profile | IT Support / Admin |
| `PUT` | `/users/{id}` | Update user details, role, department, or active status | Admin only |

---

### 2.8 System Health & Diagnostics (`/`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Root metadata endpoint with documentation links | Public |
| `GET` | `/health` | Container liveness probe endpoint (UTC timestamp & status) | Public |
| `GET` | `/api/v1/health` | API version-scoped health check endpoint | Public |
