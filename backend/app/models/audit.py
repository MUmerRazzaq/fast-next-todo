"""Audit log model for tracking all mutations."""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4

import sqlalchemy as sa
from sqlmodel import Column, Field, SQLModel

ActionTypeEnum = sa.Enum(
    "create",
    "update",
    "complete",
    "uncomplete",
    "delete",
    "recurring_auto_create",
    name="actiontype",
    create_type=False,
)



class ActionType(str, Enum):
    """Types of auditable actions."""

    CREATE = "create"
    UPDATE = "update"
    COMPLETE = "complete"
    UNCOMPLETE = "uncomplete"
    DELETE = "delete"
    RECURRING_AUTO_CREATE = "recurring_auto_create"


class AuditLog(SQLModel, table=True):
    """Immutable audit log for tracking all task mutations.

    This table is append-only - no updates or deletes are allowed.
    """

    __tablename__ = "audit_logs"

    # Primary Key
    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
        max_length=36,
        description="Unique identifier (UUID)",
    )

    # Entity Reference
    entity_type: str = Field(
        max_length=50,
        index=True,
        description="Type of entity (task, tag)",
    )
    entity_id: str = Field(
        max_length=36,
        index=True,
        description="ID of the affected entity",
    )

    # Actor
    user_id: str = Field(
        max_length=36,
        index=True,
        description="User who performed the action",
    )

    # Action Details
    action_type: ActionType = Field(
        sa_column=Column(ActionTypeEnum, nullable=False),
        description="Type of action performed",
    )
    field_changed: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Field that was changed (for updates)",
    )
    old_value: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Previous value (JSON string)",
    )
    new_value: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="New value (JSON string)",
    )

    # Metadata
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True,
        description="When the action occurred",
    )
    is_system_action: bool = Field(
        default=False,
        description="True if action was system-generated (e.g., recurring task)",
    )
