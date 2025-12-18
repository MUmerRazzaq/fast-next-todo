"""Pydantic request/response schemas.

This module exports all Pydantic schemas and provides base classes
for common response patterns.
"""

from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseSchema(BaseModel):
    """Base schema with common configuration."""

    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )


class TimestampMixin(BaseModel):
    """Mixin for timestamps in response schemas."""

    created_at: datetime
    updated_at: datetime


class ErrorDetail(BaseModel):
    """Error detail schema."""

    loc: list[str] | None = None
    msg: str
    type: str


class ErrorResponse(BaseModel):
    """Standard error response schema."""

    detail: str
    errors: list[ErrorDetail] | None = None


class MessageResponse(BaseModel):
    """Simple message response schema."""

    message: str


class PaginationMeta(BaseModel):
    """Pagination metadata schema."""

    page: int
    page_size: int
    total_items: int
    total_pages: int

    @property
    def has_next(self) -> bool:
        """Check if there's a next page."""
        return self.page < self.total_pages

    @property
    def has_previous(self) -> bool:
        """Check if there's a previous page."""
        return self.page > 1


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response schema."""

    items: list[T]
    pagination: PaginationMeta


# Import all schemas here for convenient access
# These will be added as models are implemented
from app.schemas.auth import (  # noqa: E402, F401
    AuthStatusResponse,
    SessionResponse,
    SignInRequest,
    SignUpRequest,
    TokenInfo,
    UserResponse,
)
from app.schemas.task import (  # noqa: E402, F401
    TaskCreate,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)

__all__ = [
    "BaseSchema",
    "TimestampMixin",
    "ErrorDetail",
    "ErrorResponse",
    "MessageResponse",
    "PaginationMeta",
    "PaginatedResponse",
    # Auth schemas
    "AuthStatusResponse",
    "SessionResponse",
    "SignInRequest",
    "SignUpRequest",
    "TokenInfo",
    "UserResponse",
    # Task schemas
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskListResponse",
]
