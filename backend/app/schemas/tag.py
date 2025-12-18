"""Tag Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TagBase(BaseModel):
    """Base tag schema with common fields."""

    name: str = Field(..., min_length=1, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate tag name is not empty or whitespace-only."""
        stripped = v.strip()
        if not stripped:
            raise ValueError("Tag name cannot be empty or whitespace-only")
        return stripped


class TagCreate(TagBase):
    """Schema for creating a new tag."""

    pass


class TagUpdate(BaseModel):
    """Schema for updating an existing tag."""

    name: Optional[str] = Field(None, min_length=1, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate tag name is not empty or whitespace-only."""
        if v is None:
            return v
        stripped = v.strip()
        if not stripped:
            raise ValueError("Tag name cannot be empty or whitespace-only")
        return stripped


class TagResponse(BaseModel):
    """Schema for tag responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    created_at: datetime


class TagListResponse(BaseModel):
    """Schema for paginated tag list response."""

    items: list[TagResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
