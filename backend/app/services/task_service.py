"""Task service for business logic.

Handles all task-related business operations including CRUD,
completion handling, and audit logging.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Optional
from uuid import uuid4

from sqlmodel import Session

from app.models.task import Priority, Recurrence, Task
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.audit_service import AuditService


class TaskAccessResult(str, Enum):
    """Result of a task access check."""

    SUCCESS = "success"
    NOT_FOUND = "not_found"
    FORBIDDEN = "forbidden"


class TaskService:
    """Service for task business operations.

    Encapsulates all task-related business logic and coordinates
    between the repository and audit service.
    """

    def __init__(self, session: Session) -> None:
        """Initialize with database session.

        Args:
            session: SQLAlchemy session for database operations.
        """
        self.session = session
        self.repository = TaskRepository(session)
        self.audit_service = AuditService(session)

    def get_task_with_access_check(
        self, task_id: str, user_id: str
    ) -> tuple[TaskAccessResult, Optional[Task]]:
        """Get a task with explicit access verification.

        This method distinguishes between:
        - Task not found (404)
        - Task exists but belongs to another user (403)
        - Task found and accessible (200)

        Args:
            task_id: The task ID.
            user_id: The user ID from JWT token.

        Returns:
            Tuple of (access result, task or None).
        """
        # First, check if the task exists at all
        if not self.repository.exists_by_id(task_id):
            return (TaskAccessResult.NOT_FOUND, None)

        # Task exists, check if user owns it
        task = self.repository.get_by_id(task_id, user_id)
        if not task:
            # Task exists but belongs to another user
            return (TaskAccessResult.FORBIDDEN, None)

        return (TaskAccessResult.SUCCESS, task)

    def create_task(self, user_id: str, data: TaskCreate) -> Task:
        """Create a new task.

        Args:
            user_id: ID of the user creating the task.
            data: Task creation data.

        Returns:
            The created task.
        """
        task = self.repository.create(
            user_id=user_id,
            title=data.title,
            description=data.description,
            priority=data.priority,
            due_date=data.due_date,
            recurrence=data.recurrence,
        )

        # Handle tags if provided
        if data.tag_ids:
            task = self.repository.set_tags(task, data.tag_ids, user_id)

        # Log creation
        self.audit_service.log_create(
            entity_type="task",
            entity_id=task.id,
            user_id=user_id,
            entity_data={
                "title": task.title,
                "priority": task.priority,
                "recurrence": task.recurrence,
            },
        )

        return task

    def get_task(self, task_id: str, user_id: str) -> Optional[Task]:
        """Get a task by ID for a specific user.

        Args:
            task_id: The task ID.
            user_id: The user ID.

        Returns:
            The task if found and owned by user, None otherwise.
        """
        return self.repository.get_by_id(task_id, user_id)

    def list_tasks(
        self,
        user_id: str,
        *,
        page: int = 1,
        page_size: int = 20,
        priority: Optional[Priority] = None,
        is_completed: Optional[bool] = None,
        search: Optional[str] = None,
        tag_ids: Optional[list[str]] = None,
        due_from: Optional[datetime] = None,
        due_to: Optional[datetime] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[list[Task], int]:
        """List tasks for a user with filtering and pagination.

        Args:
            user_id: The user ID.
            page: Page number.
            page_size: Items per page.
            priority: Filter by priority.
            is_completed: Filter by completion status.
            search: Search query.
            tag_ids: Filter by tags (tasks with ANY of these tags).
            due_from: Filter tasks with due date >= this datetime.
            due_to: Filter tasks with due date <= this datetime.
            sort_by: Sort field.
            sort_order: Sort direction.

        Returns:
            Tuple of (tasks, total count).
        """
        return self.repository.list_for_user(
            user_id=user_id,
            page=page,
            page_size=page_size,
            priority=priority,
            is_completed=is_completed,
            search=search,
            tag_ids=tag_ids,
            due_from=due_from,
            due_to=due_to,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    def update_task(
        self, task_id: str, user_id: str, data: TaskUpdate
    ) -> tuple[TaskAccessResult, Optional[Task]]:
        """Update a task.

        Args:
            task_id: The task ID.
            user_id: The user ID.
            data: Update data.

        Returns:
            Tuple of (access result, updated task or None).
        """
        access_result, task = self.get_task_with_access_check(task_id, user_id)
        if access_result != TaskAccessResult.SUCCESS or not task:
            return (access_result, None)

        # Track changes for audit
        changes: dict[str, tuple[Any, Any]] = {}
        update_data = data.model_dump(exclude_unset=True)

        # Handle tag_ids separately
        tag_ids = update_data.pop("tag_ids", None)

        for field, new_value in update_data.items():
            old_value = getattr(task, field)
            if old_value != new_value:
                changes[field] = (old_value, new_value)

        # Update task fields
        task = self.repository.update(task, **update_data)

        # Handle tags if provided
        if tag_ids is not None:
            task = self.repository.set_tags(task, tag_ids, user_id)

        # Log changes
        if changes:
            self.audit_service.log_updates(
                entity_type="task",
                entity_id=task.id,
                user_id=user_id,
                changes=changes,
            )

        return (TaskAccessResult.SUCCESS, task)

    def complete_task(
        self, task_id: str, user_id: str
    ) -> tuple[TaskAccessResult, Optional[tuple[Task, Optional[Task]]]]:
        """Mark a task as completed.

        If the task has a recurrence pattern, a new task is created
        with the next due date.

        Args:
            task_id: The task ID.
            user_id: The user ID.

        Returns:
            Tuple of (access result, (completed task, next recurring task) or None).
        """
        access_result, task = self.get_task_with_access_check(task_id, user_id)
        if access_result != TaskAccessResult.SUCCESS or not task:
            return (access_result, None)

        if task.is_completed:
            # Already completed, just return it
            return (TaskAccessResult.SUCCESS, (task, None))

        # Complete the task
        completed_task = self.repository.complete(task)

        # Log completion
        self.audit_service.log_complete(
            entity_type="task",
            entity_id=task.id,
            user_id=user_id,
            completed_at=completed_task.completed_at or datetime.utcnow(),
        )

        # Handle recurrence
        next_task: Optional[Task] = None
        if task.recurrence != Recurrence.NONE and task.due_date:
            next_task = self._create_recurring_task(completed_task, user_id)

        return (TaskAccessResult.SUCCESS, (completed_task, next_task))

    def uncomplete_task(
        self, task_id: str, user_id: str
    ) -> tuple[TaskAccessResult, Optional[Task]]:
        """Mark a task as incomplete.

        Args:
            task_id: The task ID.
            user_id: The user ID.

        Returns:
            Tuple of (access result, updated task or None).
        """
        access_result, task = self.get_task_with_access_check(task_id, user_id)
        if access_result != TaskAccessResult.SUCCESS or not task:
            return (access_result, None)

        if not task.is_completed:
            # Already incomplete, just return it
            return (TaskAccessResult.SUCCESS, task)

        # Uncomplete the task
        task = self.repository.uncomplete(task)

        # Log uncompletion
        self.audit_service.log_uncomplete(
            entity_type="task",
            entity_id=task.id,
            user_id=user_id,
        )

        return (TaskAccessResult.SUCCESS, task)

    def delete_task(self, task_id: str, user_id: str) -> TaskAccessResult:
        """Soft delete a task.

        Args:
            task_id: The task ID.
            user_id: The user ID.

        Returns:
            TaskAccessResult indicating success, not_found, or forbidden.
        """
        access_result, task = self.get_task_with_access_check(task_id, user_id)
        if access_result != TaskAccessResult.SUCCESS or not task:
            return access_result

        self.repository.soft_delete(task, deleted_by=user_id)

        # Log deletion
        self.audit_service.log_delete(
            entity_type="task",
            entity_id=task.id,
            user_id=user_id,
            soft_delete=True,
        )

        return TaskAccessResult.SUCCESS

    def _create_recurring_task(self, source_task: Task, user_id: str) -> Task:
        """Create the next recurring task instance.

        Args:
            source_task: The completed task that triggered recurrence.
            user_id: The user ID.

        Returns:
            The new recurring task.
        """
        # Calculate next due date
        next_due_date = self._calculate_next_due_date(
            source_task.due_date, source_task.recurrence
        )

        # Create new task
        new_task = self.repository.create(
            user_id=user_id,
            title=source_task.title,
            description=source_task.description,
            priority=source_task.priority,
            due_date=next_due_date,
            recurrence=source_task.recurrence,
        )

        # Log recurring creation
        self.audit_service.log_recurring_auto_create(
            entity_type="task",
            entity_id=new_task.id,
            user_id=user_id,
            source_task_id=source_task.id,
        )

        return new_task

    def _calculate_next_due_date(
        self, current_due_date: Optional[datetime], recurrence: Recurrence
    ) -> Optional[datetime]:
        """Calculate the next due date based on recurrence pattern.

        Args:
            current_due_date: The current due date.
            recurrence: The recurrence pattern.

        Returns:
            The next due date.
        """
        if not current_due_date:
            return None

        if recurrence == Recurrence.DAILY:
            return current_due_date + timedelta(days=1)
        elif recurrence == Recurrence.WEEKLY:
            return current_due_date + timedelta(weeks=1)
        elif recurrence == Recurrence.MONTHLY:
            # Add roughly a month (30 days)
            # For proper month handling, consider dateutil
            return current_due_date + timedelta(days=30)
        else:
            return None

    def get_overdue_tasks(self, user_id: str) -> list[Task]:
        """Get all overdue tasks for a user.

        Args:
            user_id: The user ID.

        Returns:
            List of overdue tasks.
        """
        return self.repository.get_overdue_tasks(user_id)

    def get_task_count(
        self, user_id: str, include_completed: bool = True
    ) -> int:
        """Get the total task count for a user.

        Args:
            user_id: The user ID.
            include_completed: Whether to include completed tasks.

        Returns:
            Number of tasks.
        """
        return self.repository.count_for_user(
            user_id, include_completed=include_completed
        )
