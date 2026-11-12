# NEXUS AI — Database Design & Schema Documentation

## 1. Overview
The NEXUS AI data layer uses **SQLAlchemy ORM** backed by PostgreSQL (and SQLite for local zero-setup development and CI). It is fully normalized (3NF), strictly typed, and tracks audit trails for all critical incident modifications.

---

## 2. Entity-Relationship (ER) Diagram

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
        datetime updated_at
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
        datetime closed_at
        datetime due_date
        datetime created_at
        datetime updated_at
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

    ASSIGNMENTS {
        int id PK
        int ticket_id FK
        int assigned_to_id FK
        int assigned_by_id FK
        text notes
        datetime created_at
    }

    SLA_CONFIGURATIONS {
        int id PK
        enum priority UK
        int response_time_hours
        int resolution_time_hours
        datetime created_at
        datetime updated_at
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
        text review_notes
        datetime created_at
        datetime updated_at
    }

    KNOWLEDGE_DOCUMENTS {
        int id PK
        string title
        text content
        string category
        string tags
        string source
        datetime created_at
        datetime updated_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        int ticket_id FK
        string title
        text message
        string notification_type
        boolean is_read
        datetime created_at
    }
```

---

## 3. Enumeration Reference

### User Roles
- `Employee`: Submits and tracks own incidents.
- `IT Support Agent`: Investigates, comments internally, resolves tickets.
- `Administrator`: Full system access, assigns tickets, user role management, deletions.

### Ticket Categories
`Network`, `Hardware`, `Software`, `Database`, `Security`, `Authentication`, `Application`, `Other`

### Ticket Priorities
`Low` (48h resolution SLA), `Medium` (24h resolution SLA), `High` (8h resolution SLA), `Critical` (4h resolution SLA)

### Ticket Statuses
`Open` -> `Assigned` -> `In Progress` -> `Pending` -> `Resolved` -> `Closed`

---

## 4. Database Migrations
Migrations are managed with Alembic:
- Configuration: `backend/alembic.ini` and `backend/alembic/env.py`
- Version scripts: `backend/alembic/versions/`
- Upgrade command: `alembic upgrade head`

