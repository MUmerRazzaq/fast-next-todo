"""SQLModel database models.

This module exports all database models and provides the base model class
with common fields like id and timestamps.
"""

from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlmodel import Field, SQLModel


class BaseModel(SQLModel):
    """Base model with common fields for all database tables.

    Provides:
    - id: UUID primary key (auto-generated)
    - created_at: Creation timestamp (auto-set)
    - updated_at: Last update timestamp (auto-set, auto-updated)
    """

    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
        max_length=36,
        description="Unique identifier (UUID)",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Record creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        description="Last update timestamp",
    )

    def model_dump_json_safe(self) -> dict[str, Any]:
        """Convert model to JSON-safe dictionary with datetime serialization."""
        data = self.model_dump()
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
        return data


# Import all models here to ensure they are registered with SQLModel
# These imports are used by Alembic for autogenerate
from app.models.audit import ActionType, AuditLog  # noqa: E402, F401
from app.models.tag import Tag, TaskTag  # noqa: E402, F401
from app.models.task import Priority, Recurrence, Task  # noqa: E402, F401

__all__ = [
    "BaseModel",
    "Task",
    "Tag",
    "TaskTag",
    "AuditLog",
    "Priority",
    "Recurrence",
    "ActionType",
]
