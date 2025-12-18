"""Tag model for task categorization."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.task import Task


class TaskTag(SQLModel, table=True):
    """Junction table for many-to-many Task-Tag relationship."""

    __tablename__ = "task_tags"

    task_id: str = Field(
        foreign_key="tasks.id",
        primary_key=True,
        max_length=36,
        description="Task ID",
    )
    tag_id: str = Field(
        foreign_key="tags.id",
        primary_key=True,
        max_length=36,
        description="Tag ID",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="When association was created",
    )


class Tag(SQLModel, table=True):
    """Tag model for organizing tasks."""

    __tablename__ = "tags"

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
    name: str = Field(
        max_length=50,
        description="Tag name (unique per user)",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Record creation timestamp",
    )

    # Relationships
    tasks: list["Task"] = Relationship(
        back_populates="tags",
        link_model=TaskTag,
    )
