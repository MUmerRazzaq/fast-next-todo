"""Data access repositories."""

from app.repositories.audit_repository import AuditRepository
from app.repositories.task_repository import TaskRepository

__all__ = [
    "AuditRepository",
    "TaskRepository",
]
