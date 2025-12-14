# Data Model: Intelligent Multi-User Task Management

**Feature Branch**: `001-task-management`
**Date**: 2025-12-14
**Status**: Complete

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA MODEL OVERVIEW                           │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │     User     │         │     Task     │         │     Tag      │
    │──────────────│         │──────────────│         │──────────────│
    │ id (PK)      │────┐    │ id (PK)      │    ┌────│ id (PK)      │
    │ email        │    │    │ user_id (FK) │────┘    │ user_id (FK) │
    │ password_hash│    └───>│ title        │         │ name         │
    │ created_at   │         │ description  │         │ created_at   │
    └──────────────┘         │ priority     │         └──────────────┘
                             │ due_date     │                │
                             │ recurrence   │                │
                             │ is_completed │                │
                             │ is_deleted   │                │
                             │ deleted_at   │         ┌──────┴──────┐
                             │ deleted_by   │         │   TaskTag   │
                             │ created_at   │         │─────────────│
                             │ updated_at   │<────────│ task_id(FK) │
                             └──────────────┘         │ tag_id (FK) │
                                    │                 └─────────────┘
                                    │
                                    v
                             ┌──────────────┐
                             │  AuditLog    │
                             │──────────────│
                             │ id (PK)      │
                             │ entity_type  │
                             │ entity_id    │
                             │ user_id      │
                             │ action_type  │
                             │ field_changed│
                             │ old_value    │
                             │ new_value    │
                             │ timestamp    │
                             │is_system_actn│
                             └──────────────┘
```

---

## Entity Definitions

### User

The User entity is managed by Better Auth on the frontend. The backend receives user identity via JWT claims. No explicit User table is managed by the backend.

**JWT Claims Used**:
| Claim | Type | Description |
|-------|------|-------------|
| `sub` | string (UUID) | User's unique identifier |
| `email` | string | User's email address |
| `iat` | integer | Token issued at timestamp |
| `exp` | integer | Token expiration timestamp |

**Note**: User management (registration, login, password reset) is handled by Better Auth. The backend only verifies JWT signatures and extracts claims.

---

### Task

The core entity representing a to-do item belonging to a user.

**SQLModel Definition**:
```python
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4
from sqlmodel import Field, SQLModel, Relationship

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Recurrence(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    # Primary Key
    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
        max_length=36
    )

    # Foreign Key (user from JWT)
    user_id: str = Field(index=True, max_length=36)

    # Core Fields
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Priority = Field(default=Priority.MEDIUM)
    due_date: Optional[datetime] = Field(default=None, index=True)
    recurrence: Recurrence = Field(default=Recurrence.NONE)

    # Status Fields
    is_completed: bool = Field(default=False, index=True)
    completed_at: Optional[datetime] = Field(default=None)

    # Soft Delete Fields
    is_deleted: bool = Field(default=False, index=True)
    deleted_at: Optional[datetime] = Field(default=None)
    deleted_by: Optional[str] = Field(default=None, max_length=36)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tags: list["Tag"] = Relationship(
        back_populates="tasks",
        link_model="TaskTag"
    )
```

**Field Constraints**:
| Field | Type | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| id | UUID/string | No | auto-generated | PK, 36 chars |
| user_id | UUID/string | No | - | FK (from JWT), indexed |
| title | string | No | - | max 200 chars |
| description | string | Yes | null | max 2000 chars |
| priority | enum | No | "medium" | low/medium/high |
| due_date | datetime | Yes | null | indexed |
| recurrence | enum | No | "none" | none/daily/weekly/monthly |
| is_completed | boolean | No | false | indexed |
| completed_at | datetime | Yes | null | set on completion |
| is_deleted | boolean | No | false | indexed |
| deleted_at | datetime | Yes | null | set on soft delete |
| deleted_by | UUID/string | Yes | null | user who deleted |
| created_at | datetime | No | now() | immutable |
| updated_at | datetime | No | now() | updated on change |

**Indexes**:
```sql
CREATE INDEX ix_task_user_id ON tasks(user_id);
CREATE INDEX ix_task_user_deleted ON tasks(user_id, is_deleted);
CREATE INDEX ix_task_user_status ON tasks(user_id, is_completed, is_deleted);
CREATE INDEX ix_task_due_date ON tasks(user_id, due_date) WHERE is_deleted = false;
CREATE INDEX ix_task_priority ON tasks(user_id, priority) WHERE is_deleted = false;
CREATE INDEX ix_task_created ON tasks(user_id, created_at DESC) WHERE is_deleted = false;
```

---

### Tag

A reusable label for organizing tasks. Tags are scoped to individual users.

**SQLModel Definition**:
```python
class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    # Primary Key
    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
        max_length=36
    )

    # Foreign Key (user from JWT)
    user_id: str = Field(index=True, max_length=36)

    # Core Fields
    name: str = Field(max_length=50)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: list["Task"] = Relationship(
        back_populates="tags",
        link_model="TaskTag"
    )
```

**Field Constraints**:
| Field | Type | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| id | UUID/string | No | auto-generated | PK, 36 chars |
| user_id | UUID/string | No | - | FK (from JWT), indexed |
| name | string | No | - | max 50 chars |
| created_at | datetime | No | now() | immutable |

**Indexes**:
```sql
CREATE INDEX ix_tag_user_id ON tags(user_id);
CREATE UNIQUE INDEX ix_tag_user_name ON tags(user_id, name);
```

**Validation Rules**:
- Tag names are case-insensitive for uniqueness check
- Maximum 10 tags per task (enforced at application level)
- Tag name cannot be empty or whitespace-only

---

### TaskTag (Junction Table)

Many-to-many relationship between Task and Tag.

**SQLModel Definition**:
```python
class TaskTag(SQLModel, table=True):
    __tablename__ = "task_tags"

    task_id: str = Field(
        foreign_key="tasks.id",
        primary_key=True,
        max_length=36,
        ondelete="CASCADE"
    )
    tag_id: str = Field(
        foreign_key="tags.id",
        primary_key=True,
        max_length=36,
        ondelete="CASCADE"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Field Constraints**:
| Field | Type | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| task_id | UUID/string | No | - | Composite PK, FK to tasks |
| tag_id | UUID/string | No | - | Composite PK, FK to tags |
| created_at | datetime | No | now() | when association created |

**Indexes**:
```sql
CREATE INDEX ix_tasktag_task ON task_tags(task_id);
CREATE INDEX ix_tasktag_tag ON task_tags(tag_id);
```

---

### AuditLog

Immutable event-based log for all task mutations.

**SQLModel Definition**:
```python
class ActionType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    COMPLETE = "complete"
    UNCOMPLETE = "uncomplete"
    DELETE = "delete"
    RECURRING_AUTO_CREATE = "recurring_auto_create"

class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    # Primary Key
    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
        max_length=36
    )

    # Entity Reference
    entity_type: str = Field(max_length=50, index=True)  # "task", "tag"
    entity_id: str = Field(max_length=36, index=True)

    # Actor
    user_id: str = Field(max_length=36, index=True)

    # Action Details
    action_type: ActionType
    field_changed: Optional[str] = Field(default=None, max_length=50)
    old_value: Optional[str] = Field(default=None, max_length=2000)
    new_value: Optional[str] = Field(default=None, max_length=2000)

    # Metadata
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        index=True
    )
    is_system_action: bool = Field(default=False)
```

**Field Constraints**:
| Field | Type | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| id | UUID/string | No | auto-generated | PK, 36 chars |
| entity_type | string | No | - | "task" or "tag" |
| entity_id | UUID/string | No | - | reference to entity |
| user_id | UUID/string | No | - | who performed action |
| action_type | enum | No | - | see ActionType enum |
| field_changed | string | Yes | null | for updates only |
| old_value | string | Yes | null | previous value (JSON string) |
| new_value | string | Yes | null | new value (JSON string) |
| timestamp | datetime | No | now() | when action occurred |
| is_system_action | boolean | No | false | true for automated actions |

**Indexes**:
```sql
CREATE INDEX ix_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX ix_audit_user ON audit_logs(user_id);
CREATE INDEX ix_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX ix_audit_entity_time ON audit_logs(entity_type, entity_id, timestamp DESC);
```

**Immutability Rules**:
- No UPDATE operations allowed on audit_logs table
- No DELETE operations allowed on audit_logs table
- Only INSERT operations permitted
- Enforced via application layer (no database triggers)

---

## State Transitions

### Task Lifecycle

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    v                                         │
    ┌──────────┐ create ┌──────────┐  complete  ┌──────────┐ │
    │          │───────>│  ACTIVE  │───────────>│ COMPLETED│ │
    │  (none)  │        │          │            │          │ │
    └──────────┘        └──────────┘            └──────────┘ │
                              │                      │       │
                              │ uncomplete          │       │ recurring
                              │<─────────────────────        │
                              │                              │
                              │ delete (soft)                │
                              v                              │
                        ┌──────────┐                         │
                        │ DELETED  │                         │
                        │ (soft)   │                         │
                        └──────────┘                         │
                                                             │
    If recurring:                                            │
    COMPLETED + recurring ─────── auto-create ───────────────┘
                                  new ACTIVE task
```

### Task State Transitions Table

| From State | Action | To State | Audit Log Entry |
|------------|--------|----------|-----------------|
| (none) | create | ACTIVE | action_type=create |
| ACTIVE | update | ACTIVE | action_type=update (per field) |
| ACTIVE | complete | COMPLETED | action_type=complete |
| COMPLETED | uncomplete | ACTIVE | action_type=uncomplete |
| ACTIVE | delete | DELETED | action_type=delete |
| COMPLETED | delete | DELETED | action_type=delete |
| COMPLETED (recurring) | complete | COMPLETED + new ACTIVE | action_type=recurring_auto_create |

---

## Validation Rules Summary

### Task Validation

| Rule | Field(s) | Error Message |
|------|----------|---------------|
| Required | title | "Title is required" |
| Max length | title | "Title must be 200 characters or less" |
| Max length | description | "Description must be 2000 characters or less" |
| Valid enum | priority | "Priority must be low, medium, or high" |
| Valid enum | recurrence | "Recurrence must be none, daily, weekly, or monthly" |
| Future date warning | due_date | "Due date is in the past" (warning, not error) |
| Max tags | tags | "Maximum 10 tags per task" |

### Tag Validation

| Rule | Field(s) | Error Message |
|------|----------|---------------|
| Required | name | "Tag name is required" |
| Max length | name | "Tag name must be 50 characters or less" |
| Unique per user | name + user_id | "Tag with this name already exists" |
| Not whitespace | name | "Tag name cannot be empty" |

---

## Query Patterns

### Common Queries

**1. List user's active tasks (default view)**:
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND is_deleted = false
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```

**2. Filter by status, priority, tag**:
```sql
SELECT DISTINCT t.* FROM tasks t
LEFT JOIN task_tags tt ON t.id = tt.task_id
WHERE t.user_id = :user_id
  AND t.is_deleted = false
  AND (:status IS NULL OR t.is_completed = :status)
  AND (:priority IS NULL OR t.priority = :priority)
  AND (:tag_id IS NULL OR tt.tag_id = :tag_id)
ORDER BY t.due_date ASC NULLS LAST;
```

**3. Search by title/description**:
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND is_deleted = false
  AND (title ILIKE :search OR description ILIKE :search)
ORDER BY created_at DESC;
```

**4. Get task with tags**:
```sql
SELECT t.*, array_agg(tg.name) as tag_names
FROM tasks t
LEFT JOIN task_tags tt ON t.id = tt.task_id
LEFT JOIN tags tg ON tt.tag_id = tg.id
WHERE t.id = :task_id AND t.user_id = :user_id
GROUP BY t.id;
```

**5. Get audit history for task**:
```sql
SELECT * FROM audit_logs
WHERE entity_type = 'task'
  AND entity_id = :task_id
  AND user_id = :user_id
ORDER BY timestamp DESC;
```

---

## Migration Strategy

Migrations will be managed via Alembic. Initial migration creates all tables with proper indexes and constraints.

**Migration Order**:
1. Create `tasks` table
2. Create `tags` table
3. Create `task_tags` junction table
4. Create `audit_logs` table
5. Add all indexes

**Rollback Strategy**:
- Each migration includes a `downgrade()` function
- Soft-deleted data is preserved during rollbacks
- Audit logs are never deleted during migrations
