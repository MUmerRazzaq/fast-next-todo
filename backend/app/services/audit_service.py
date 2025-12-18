"""Audit service for logging all entity mutations.

Provides high-level methods for creating audit log entries for
different types of actions (create, update, delete, etc.).
"""

import json
from datetime import datetime
from typing import Any, Optional

from sqlmodel import Session

from app.models.audit import ActionType, AuditLog
from app.repositories.audit_repository import AuditRepository


class AuditService:
    """Service for audit logging operations.

    This service provides convenient methods for logging different
    types of mutations on entities.
    """

    def __init__(self, session: Session) -> None:
        """Initialize with database session.

        Args:
            session: SQLAlchemy session for database operations.
        """
        self.repository = AuditRepository(session)

    def _serialize_value(self, value: Any) -> Optional[str]:
        """Serialize a value to JSON string for storage.

        Args:
            value: The value to serialize.

        Returns:
            JSON string representation or None if value is None.
        """
        if value is None:
            return None

        # Handle datetime objects
        if isinstance(value, datetime):
            return json.dumps(value.isoformat())

        # Handle enums
        if hasattr(value, "value"):
            return json.dumps(value.value)

        # Try JSON serialization
        try:
            return json.dumps(value)
        except (TypeError, ValueError):
            return json.dumps(str(value))

    def log_create(
        self,
        entity_type: str,
        entity_id: str,
        user_id: str,
        entity_data: Optional[dict[str, Any]] = None,
        *,
        is_system_action: bool = False,
    ) -> AuditLog:
        """Log an entity creation.

        Args:
            entity_type: Type of entity (e.g., "task", "tag").
            entity_id: ID of the created entity.
            user_id: ID of the user who created the entity.
            entity_data: Optional dict of entity fields for new_value.
            is_system_action: True if this was a system-generated action.

        Returns:
            The created audit log entry.
        """
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            action_type=ActionType.CREATE,
            new_value=self._serialize_value(entity_data),
            is_system_action=is_system_action,
        )
        return self.repository.create(audit_log)

    def log_update(
        self,
        entity_type: str,
        entity_id: str,
        user_id: str,
        field_changed: str,
        old_value: Any,
        new_value: Any,
    ) -> AuditLog:
        """Log a field update on an entity.

        Args:
            entity_type: Type of entity.
            entity_id: ID of the updated entity.
            user_id: ID of the user who made the update.
            field_changed: Name of the field that was changed.
            old_value: Previous value of the field.
            new_value: New value of the field.

        Returns:
            The created audit log entry.
        """
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            action_type=ActionType.UPDATE,
            field_changed=field_changed,
            old_value=self._serialize_value(old_value),
            new_value=self._serialize_value(new_value),
        )
        return self.repository.create(audit_log)

    def log_updates(
        self,
        entity_type: str,
        entity_id: str,
        user_id: str,
        changes: dict[str, tuple[Any, Any]],
    ) -> list[AuditLog]:
        """Log multiple field updates on an entity.

        Args:
            entity_type: Type of entity.
            entity_id: ID of the updated entity.
            user_id: ID of the user who made the updates.
            changes: Dict mapping field names to (old_value, new_value) tuples.

        Returns:
            List of created audit log entries.
        """
        audit_logs = []
        for field_name, (old_value, new_value) in changes.items():
            audit_log = self.log_update(
                entity_type=entity_type,
                entity_id=entity_id,
                user_id=user_id,
                field_changed=field_name,
                old_value=old_value,
                new_value=new_value,
            )
            audit_logs.append(audit_log)
        return audit_logs

    def log_complete(
        self,
        entity_type: str,
        entity_id: str,
        user_id: str,
        completed_at: datetime,
    ) -> AuditLog:
        """Log task completion.

        Args:
            entity_type: Type of entity (usually "task").
            entity_id: ID of the completed entity.
            user_id: ID of the user who completed the task.
            completed_at: Timestamp when task was completed.

        Returns:
            The created audit log entry.
        """
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            action_type=ActionType.COMPLETE,
            field_changed="is_completed",
            old_value=self._serialize_value(False),
            new_value=self._serialize_value(True),
        )
        return self.repository.create(audit_log)

    def log_uncomplete(
        self,
        entity_type: str,
        entity_id: str,
        user_id: str,
    ) -> AuditLog:
        """Log task uncompletion (marking incomplete).

        Args:
            entity_type: Type of entity (usually "task").
            entity_id: ID of the entity.
            user_id: ID of the user who uncompleted the task.

        Returns:
            The created audit log entry.
        """
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            action_type=ActionType.UNCOMPLETE,
            field_changed="is_completed",
            old_value=self._serialize_value(True),
            new_value=self._serialize_value(False),
        )
        return self.repository.create(audit_log)

    def log_delete(
        self,
        entity_type: str,
        entity_id: str,
        user_id: str,
        *,
        soft_delete: bool = True,
    ) -> AuditLog:
        """Log entity deletion.

        Args:
            entity_type: Type of entity.
            entity_id: ID of the deleted entity.
            user_id: ID of the user who deleted the entity.
            soft_delete: True if this is a soft delete (default).

        Returns:
            The created audit log entry.
        """
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            action_type=ActionType.DELETE,
            field_changed="is_deleted" if soft_delete else None,
            old_value=self._serialize_value(False) if soft_delete else None,
            new_value=self._serialize_value(True) if soft_delete else None,
        )
        return self.repository.create(audit_log)

    def log_recurring_auto_create(
        self,
        entity_type: str,
        entity_id: str,
        user_id: str,
        source_task_id: str,
    ) -> AuditLog:
        """Log automatic creation of a recurring task.

        Args:
            entity_type: Type of entity (usually "task").
            entity_id: ID of the newly created recurring task.
            user_id: ID of the user who owns the task.
            source_task_id: ID of the original task that triggered this.

        Returns:
            The created audit log entry.
        """
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            action_type=ActionType.RECURRING_AUTO_CREATE,
            new_value=self._serialize_value({"source_task_id": source_task_id}),
            is_system_action=True,
        )
        return self.repository.create(audit_log)

    def get_entity_history(
        self,
        entity_type: str,
        entity_id: str,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AuditLog]:
        """Get audit history for an entity.

        Args:
            entity_type: Type of entity.
            entity_id: ID of the entity.
            limit: Maximum number of records to return.
            offset: Number of records to skip.

        Returns:
            List of audit logs ordered by timestamp descending.
        """
        return self.repository.get_by_entity(
            entity_type=entity_type,
            entity_id=entity_id,
            limit=limit,
            offset=offset,
        )

    def get_user_activity(
        self,
        user_id: str,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AuditLog]:
        """Get audit logs for user's actions.

        Args:
            user_id: ID of the user.
            limit: Maximum number of records to return.
            offset: Number of records to skip.

        Returns:
            List of audit logs ordered by timestamp descending.
        """
        return self.repository.get_by_user(
            user_id=user_id,
            limit=limit,
            offset=offset,
        )
