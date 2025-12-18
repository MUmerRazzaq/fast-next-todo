"""Task model for the todo application."""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlmodel import Column, Field, Relationship, SQLModel

from app.models.tag import TaskTag

if TYPE_CHECKING:
    from app.models.tag import Tag


class Priority(str, Enum):
    """Task priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Recurrence(str, Enum):
    """Task recurrence patterns."""

    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


# PostgreSQL native enum types
PriorityEnum = sa.Enum("low", "medium", "high", name="priority", create_type=False)
RecurrenceEnum = sa.Enum("none", "daily", "weekly", "monthly", name="recurrence", create_type=False)


class Task(SQLModel, table=True):
    """Task model representing a to-do item belonging to a user."""

    __tablename__ = "tasks"

    # Primary Key
    id: str = Field(
        primary_key=True,
        max_length=36,
        description="Unique identifier (UUID)",
    )

    # Foreign Key (user from JWT)
    user_id: str = Field(
        index=True,
        max_length=36,
        description="Owner user ID from JWT sub claim",
    )

    # Core Fields
    title: str = Field(
        max_length=200,
        description="Task title (required)",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Task description (optional)",
    )
    priority: Priority = Field(
        default=Priority.MEDIUM,
        sa_column=Column(PriorityEnum, nullable=False, server_default="medium"),
        description="Task priority level",
    )
    due_date: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Due date and time (optional)",
    )
    recurrence: Recurrence = Field(
        default=Recurrence.NONE,
        sa_column=Column(RecurrenceEnum, nullable=False, server_default="none"),
        description="Recurrence pattern",
    )

    # Status Fields
    is_completed: bool = Field(
        default=False,
        index=True,
        description="Whether task is completed",
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        description="Completion timestamp",
    )

    # Soft Delete Fields
    is_deleted: bool = Field(
        default=False,
        index=True,
        description="Soft delete flag",
    )
    deleted_at: Optional[datetime] = Field(
        default=None,
        description="Deletion timestamp",
    )
    deleted_by: Optional[str] = Field(
        default=None,
        max_length=36,
        description="User who deleted the task",
    )

    # Timestamps
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

    # Relationships
    tags: list["Tag"] = Relationship(
        back_populates="tasks",
        link_model=TaskTag,
    )

    @property
    def is_overdue(self) -> bool:
        """Check if task is overdue (past due date and not completed)."""
        if self.due_date is None or self.is_completed:
            return False
        return datetime.utcnow() > self.due_date
