"""Audit log repository for append-only operations.

This repository enforces the immutability of audit logs - only create
and read operations are permitted. Updates and deletes are intentionally
not implemented.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from app.models.audit import ActionType, AuditLog


class AuditRepository:
    """Repository for audit log operations.

    This is an append-only repository - no update or delete methods exist.
    """

    def __init__(self, session: Session) -> None:
        """Initialize with database session.

        Args:
            session: SQLAlchemy session for database operations.
        """
        self.session = session

    def create(self, audit_log: AuditLog) -> AuditLog:
        """Create a new audit log entry.

        Args:
            audit_log: The audit log entry to persist.

        Returns:
            The persisted audit log with generated ID.
        """
        self.session.add(audit_log)
        self.session.flush()
        self.session.refresh(audit_log)
        return audit_log

    def get_by_id(self, audit_id: str) -> Optional[AuditLog]:
        """Get an audit log entry by ID.

        Args:
            audit_id: The unique identifier of the audit log.

        Returns:
            The audit log if found, None otherwise.
        """
        return self.session.get(AuditLog, audit_id)

    def get_by_entity(
        self,
        entity_type: str,
        entity_id: str,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AuditLog]:
        """Get audit logs for a specific entity.

        Args:
            entity_type: Type of entity (e.g., "task", "tag").
            entity_id: ID of the entity.
            limit: Maximum number of records to return.
            offset: Number of records to skip.

        Returns:
            List of audit logs ordered by timestamp descending.
        """
        statement = (
            select(AuditLog)
            .where(AuditLog.entity_type == entity_type)
            .where(AuditLog.entity_id == entity_id)
            .order_by(AuditLog.timestamp.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_by_user(
        self,
        user_id: str,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AuditLog]:
        """Get audit logs for a specific user.

        Args:
            user_id: ID of the user who performed actions.
            limit: Maximum number of records to return.
            offset: Number of records to skip.

        Returns:
            List of audit logs ordered by timestamp descending.
        """
        statement = (
            select(AuditLog)
            .where(AuditLog.user_id == user_id)
            .order_by(AuditLog.timestamp.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_by_action_type(
        self,
        action_type: ActionType,
        *,
        since: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AuditLog]:
        """Get audit logs by action type.

        Args:
            action_type: Type of action to filter by.
            since: Only return logs after this timestamp.
            limit: Maximum number of records to return.
            offset: Number of records to skip.

        Returns:
            List of audit logs ordered by timestamp descending.
        """
        statement = (
            select(AuditLog)
            .where(AuditLog.action_type == action_type)
            .order_by(AuditLog.timestamp.desc())
            .offset(offset)
            .limit(limit)
        )

        if since:
            statement = statement.where(AuditLog.timestamp >= since)

        return list(self.session.exec(statement).all())

    def count_by_entity(self, entity_type: str, entity_id: str) -> int:
        """Count audit logs for a specific entity.

        Args:
            entity_type: Type of entity.
            entity_id: ID of the entity.

        Returns:
            Number of audit log entries.
        """
        statement = (
            select(AuditLog)
            .where(AuditLog.entity_type == entity_type)
            .where(AuditLog.entity_id == entity_id)
        )
        return len(list(self.session.exec(statement).all()))

    def count_by_user(self, user_id: str) -> int:
        """Count audit logs for a specific user.

        Args:
            user_id: ID of the user.

        Returns:
            Number of audit log entries.
        """
        statement = select(AuditLog).where(AuditLog.user_id == user_id)
        return len(list(self.session.exec(statement).all()))
