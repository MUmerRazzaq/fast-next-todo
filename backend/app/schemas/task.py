"""Task Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import Priority, Recurrence


class TaskBase(BaseModel):
    """Base task schema with common fields."""

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Priority = Priority.MEDIUM
    due_date: Optional[datetime] = None
    recurrence: Recurrence = Recurrence.NONE


class TaskCreate(TaskBase):
    """Schema for creating a new task."""

    tag_ids: list[str] = Field(default_factory=list, max_length=10)


class TaskUpdate(BaseModel):
    """Schema for updating an existing task.

    All fields are optional to support partial updates.
    """

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    recurrence: Optional[Recurrence] = None
    tag_ids: Optional[list[str]] = Field(None, max_length=10)


class TagInTask(BaseModel):
    """Embedded tag schema for task responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str


class TaskResponse(BaseModel):
    """Schema for task responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    description: Optional[str]
    priority: Priority
    due_date: Optional[datetime]
    recurrence: Recurrence
    is_completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    tags: list[TagInTask] = Field(default_factory=list)

    @property
    def is_overdue(self) -> bool:
        """Check if task is overdue."""
        if self.due_date is None or self.is_completed:
            return False
        return datetime.utcnow() > self.due_date


class TaskListResponse(BaseModel):
    """Schema for paginated task list response."""

    items: list[TaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CompleteTaskResponse(TaskResponse):
    """Schema for complete task response (may include next recurring task)."""

    next_task: Optional[TaskResponse] = None
