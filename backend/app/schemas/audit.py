"""Audit log Pydantic schemas for API requests/responses."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.audit import ActionType


class AuditLogResponse(BaseModel):
    """Response schema for a single audit log entry."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_type: str
    entity_id: str
    user_id: str
    action_type: ActionType
    field_changed: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    timestamp: datetime
    is_system_action: bool


class AuditLogListResponse(BaseModel):
    """Response schema for a list of audit logs."""

    items: list[AuditLogResponse]
    total: int
