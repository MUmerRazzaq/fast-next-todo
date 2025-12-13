# Common PostgreSQL Schema Patterns with SQLModel

## Table of Contents
- [Timestamp & Audit Patterns](#timestamp--audit-patterns)
- [Soft Delete Pattern](#soft-delete-pattern)
- [User & Role (RBAC) Pattern](#user--role-rbac-pattern)
- [Multi-Tenancy Pattern](#multi-tenancy-pattern)
- [Audit Log Pattern](#audit-log-pattern)
- [Hierarchical Data (Tree) Pattern](#hierarchical-data-tree-pattern)
- [Enum/Status Pattern](#enumstatus-pattern)
- [JSONB Metadata Pattern](#jsonb-metadata-pattern)

## Timestamp & Audit Patterns

### Basic Timestamps
```python
from datetime import datetime
from sqlmodel import Field, SQLModel


class TimestampMixin(SQLModel):
    """Mixin for automatic timestamps."""
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )


class User(TimestampMixin, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
```

### Server-Side Timestamps (Recommended)
```python
from sqlalchemy import Column, DateTime, func, text
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str

    # Server-side default
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        )
    )
```

### PostgreSQL Trigger for updated_at
```sql
-- More reliable than application-side updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Soft Delete Pattern

```python
import uuid
from datetime import datetime
from sqlmodel import Field, SQLModel, Session, select


class SoftDeleteMixin(SQLModel):
    """Mixin for soft delete functionality."""
    deleted_at: datetime | None = Field(default=None, index=True)

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


class User(SoftDeleteMixin, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True)
    name: str


# Soft delete operation
def soft_delete_user(session: Session, user: User) -> None:
    user.deleted_at = datetime.utcnow()
    session.add(user)
    session.commit()


# Query only active records
def get_active_users(session: Session) -> list[User]:
    statement = select(User).where(User.deleted_at == None)
    return session.exec(statement).all()


# Restore deleted record
def restore_user(session: Session, user: User) -> None:
    user.deleted_at = None
    session.add(user)
    session.commit()
```

### Partial Index for Active Records
```python
from sqlalchemy import Index, text

class User(SoftDeleteMixin, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str

    __table_args__ = (
        # Only index non-deleted users (smaller, faster)
        Index(
            'idx_user_email_active',
            'email',
            unique=True,
            postgresql_where=text('deleted_at IS NULL')
        ),
    )
```

## User & Role (RBAC) Pattern

```python
import uuid
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel


# Link table for many-to-many
class UserRoleLink(SQLModel, table=True):
    """Junction table for User-Role many-to-many relationship."""
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    role_id: uuid.UUID = Field(foreign_key="role.id", primary_key=True)
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_by: uuid.UUID | None = Field(default=None, foreign_key="user.id")


class Role(SQLModel, table=True):
    """Role definition for authorization."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: str | None = None

    # Relationships
    users: list["User"] = Relationship(
        back_populates="roles",
        link_model=UserRoleLink
    )
    permissions: list["Permission"] = Relationship(
        back_populates="roles",
        link_model=RolePermissionLink
    )


class Permission(SQLModel, table=True):
    """Individual permission definition."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)  # e.g., "user:read", "post:write"
    description: str | None = None

    roles: list[Role] = Relationship(
        back_populates="permissions",
        link_model=RolePermissionLink
    )


class RolePermissionLink(SQLModel, table=True):
    """Junction table for Role-Permission relationship."""
    role_id: uuid.UUID = Field(foreign_key="role.id", primary_key=True)
    permission_id: uuid.UUID = Field(foreign_key="permission.id", primary_key=True)


class User(SQLModel, table=True):
    """User account."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    is_active: bool = Field(default=True)

    roles: list[Role] = Relationship(
        back_populates="users",
        link_model=UserRoleLink
    )

    def has_permission(self, permission_name: str) -> bool:
        """Check if user has a specific permission via any role."""
        for role in self.roles:
            for permission in role.permissions:
                if permission.name == permission_name:
                    return True
        return False
```

## Multi-Tenancy Pattern

### Column-Based (Shared Schema)
```python
import uuid
from sqlmodel import Field, Relationship, SQLModel, Session, select


class Tenant(SQLModel, table=True):
    """Tenant/Organization account."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    subdomain: str = Field(unique=True, index=True)
    is_active: bool = Field(default=True)


class TenantMixin(SQLModel):
    """Mixin to add tenant_id to models."""
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", index=True)


class User(TenantMixin, table=True):
    """User scoped to a tenant."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True)
    name: str

    __table_args__ = (
        # Unique email per tenant
        Index('idx_user_tenant_email', 'tenant_id', 'email', unique=True),
    )


class Project(TenantMixin, table=True):
    """Project scoped to a tenant."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)

    __table_args__ = (
        Index('idx_project_tenant_name', 'tenant_id', 'name'),
    )


# Always filter by tenant
def get_tenant_users(session: Session, tenant_id: uuid.UUID) -> list[User]:
    statement = select(User).where(User.tenant_id == tenant_id)
    return session.exec(statement).all()
```

### Row-Level Security (RLS) for Multi-Tenancy
```sql
-- Enable RLS on table
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their tenant's data
CREATE POLICY tenant_isolation ON "user"
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Set tenant context before queries
SET app.current_tenant = 'tenant-uuid-here';
```

## Audit Log Pattern

```python
import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class AuditAction(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class AuditLog(SQLModel, table=True):
    """Immutable audit trail for data changes."""
    id: int | None = Field(default=None, primary_key=True)  # Auto-increment for ordering

    # What changed
    table_name: str = Field(index=True)
    record_id: uuid.UUID = Field(index=True)
    action: str = Field(index=True)  # CREATE, UPDATE, DELETE

    # Who changed it
    user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id", index=True)

    # Change details
    old_values: dict | None = Field(default=None, sa_column=Column(JSONB))
    new_values: dict | None = Field(default=None, sa_column=Column(JSONB))

    # Context
    ip_address: str | None = None
    user_agent: str | None = None

    # When
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    __table_args__ = (
        Index('idx_audit_table_record', 'table_name', 'record_id'),
        Index('idx_audit_created', 'created_at'),
    )


def create_audit_log(
    session,
    table_name: str,
    record_id: uuid.UUID,
    action: AuditAction,
    user_id: uuid.UUID | None = None,
    old_values: dict | None = None,
    new_values: dict | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """Create an audit log entry."""
    audit = AuditLog(
        table_name=table_name,
        record_id=record_id,
        action=action.value,
        user_id=user_id,
        old_values=old_values,
        new_values=new_values,
        ip_address=ip_address,
    )
    session.add(audit)
    return audit
```

### PostgreSQL Trigger-Based Audit
```sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_values, created_at)
        VALUES (TG_TABLE_NAME, NEW.id, 'CREATE', to_jsonb(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_at)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, created_at)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), NOW());
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply to a table
CREATE TRIGGER user_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "user"
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

## Hierarchical Data (Tree) Pattern

### Adjacency List (Simple)
```python
import uuid
from sqlmodel import Field, Relationship, SQLModel


class Category(SQLModel, table=True):
    """Category with parent-child hierarchy."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)

    # Self-referential relationship
    parent_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="category.id",
        index=True
    )

    # Relationships
    parent: "Category | None" = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Category.id"}
    )
    children: list["Category"] = Relationship(back_populates="parent")
```

### Materialized Path (For Deep Hierarchies)
```python
class Category(SQLModel, table=True):
    """Category with materialized path for efficient tree queries."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str

    # Path like "/root/parent/child"
    path: str = Field(index=True)
    depth: int = Field(default=0)

    parent_id: uuid.UUID | None = Field(default=None, foreign_key="category.id")


# Query all descendants
def get_descendants(session, category: Category):
    return session.exec(
        select(Category).where(Category.path.startswith(category.path + "/"))
    ).all()
```

### PostgreSQL ltree Extension
```sql
CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE category (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    path ltree
);

CREATE INDEX idx_category_path ON category USING GIST (path);

-- Query descendants
SELECT * FROM category WHERE path <@ 'root.parent';

-- Query ancestors
SELECT * FROM category WHERE path @> 'root.parent.child';
```

## Enum/Status Pattern

### Python Enum with SQLModel
```python
from enum import Enum
from sqlmodel import Field, SQLModel


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    status: OrderStatus = Field(default=OrderStatus.PENDING, index=True)
```

### PostgreSQL Native Enum
```python
from sqlalchemy import Column, Enum as SAEnum
from sqlmodel import Field, SQLModel


class Order(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)

    # Native PostgreSQL ENUM
    status: str = Field(
        sa_column=Column(
            SAEnum('pending', 'confirmed', 'shipped', 'delivered', 'cancelled',
                   name='order_status'),
            default='pending'
        )
    )
```

## JSONB Metadata Pattern

```python
from typing import Any
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True)

    # Flexible metadata storage
    metadata: dict[str, Any] = Field(
        default={},
        sa_column=Column(JSONB, default={})
    )

    # Structured preferences
    preferences: dict[str, Any] = Field(
        default={"theme": "light", "notifications": True},
        sa_column=Column(JSONB, default={})
    )

    __table_args__ = (
        # GIN index for JSONB queries
        Index('idx_user_metadata', 'metadata', postgresql_using='gin'),
    )


# Query JSONB fields
def get_users_with_dark_theme(session):
    return session.exec(
        select(User).where(
            User.preferences["theme"].astext == "dark"
        )
    ).all()
```

### JSONB Query Examples
```sql
-- Check if key exists
SELECT * FROM "user" WHERE metadata ? 'feature_flags';

-- Check key-value
SELECT * FROM "user" WHERE metadata @> '{"plan": "premium"}';

-- Access nested value
SELECT * FROM "user" WHERE metadata -> 'settings' ->> 'theme' = 'dark';

-- Array containment
SELECT * FROM "user" WHERE metadata -> 'tags' ? 'vip';
```
