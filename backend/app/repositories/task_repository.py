"""Task repository for database operations.

Handles all task-related database queries with user scoping
and soft delete support.
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlmodel import Session, select, func

from app.models.tag import Tag, TaskTag
from app.models.task import Priority, Recurrence, Task


class TaskRepository:
    """Repository for task database operations.

    All queries are scoped to the current user to ensure data isolation.
    Soft delete is used by default - tasks are marked as deleted rather
    than being removed from the database.
    """

    def __init__(self, session: Session) -> None:
        """Initialize with database session.

        Args:
            session: SQLAlchemy session for database operations.
        """
        self.session = session

    def create(
        self,
        user_id: str,
        title: str,
        description: Optional[str] = None,
        priority: Priority = Priority.MEDIUM,
        due_date: Optional[datetime] = None,
        recurrence: Recurrence = Recurrence.NONE,
    ) -> Task:
        """Create a new task.

        Args:
            user_id: ID of the user who owns the task.
            title: Task title.
            description: Optional task description.
            priority: Task priority level.
            due_date: Optional due date.
            recurrence: Recurrence pattern.

        Returns:
            The created task.
        """
        task = Task(
            id=str(uuid4()),
            user_id=user_id,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            recurrence=recurrence,
        )
        self.session.add(task)
        self.session.flush()
        self.session.refresh(task)
        return task

    def get_by_id(self, task_id: str, user_id: str) -> Optional[Task]:
        """Get a task by ID for a specific user.

        Args:
            task_id: The task ID.
            user_id: The user ID (for ownership verification).

        Returns:
            The task if found and owned by user, None otherwise.
        """
        statement = (
            select(Task)
            .where(Task.id == task_id)
            .where(Task.user_id == user_id)
            .where(Task.is_deleted == False)  # noqa: E712
        )
        return self.session.exec(statement).first()

    def exists_by_id(self, task_id: str) -> bool:
        """Check if a task exists by ID (regardless of owner).

        Used for ownership verification to distinguish between
        404 (not found) and 403 (forbidden) responses.

        Args:
            task_id: The task ID to check.

        Returns:
            True if task exists (not deleted), False otherwise.
        """
        statement = (
            select(func.count())
            .select_from(Task)
            .where(Task.id == task_id)
            .where(Task.is_deleted == False)  # noqa: E712
        )
        count = self.session.exec(statement).one()
        return count > 0

    def get_by_id_including_deleted(
        self, task_id: str, user_id: str
    ) -> Optional[Task]:
        """Get a task by ID including soft-deleted tasks.

        Args:
            task_id: The task ID.
            user_id: The user ID.

        Returns:
            The task if found, None otherwise.
        """
        statement = (
            select(Task)
            .where(Task.id == task_id)
            .where(Task.user_id == user_id)
        )
        return self.session.exec(statement).first()

    def list_for_user(
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
            page: Page number (1-indexed).
            page_size: Number of items per page.
            priority: Filter by priority.
            is_completed: Filter by completion status.
            search: Search in title and description.
            tag_ids: Filter by tags (tasks that have ANY of these tags).
            due_from: Filter tasks with due date >= this datetime.
            due_to: Filter tasks with due date <= this datetime.
            sort_by: Field to sort by.
            sort_order: Sort direction (asc/desc).

        Returns:
            Tuple of (list of tasks, total count).
        """
        # Base query with user filter and excluding deleted
        base_query = (
            select(Task)
            .where(Task.user_id == user_id)
            .where(Task.is_deleted == False)  # noqa: E712
        )

        # Apply filters
        if priority is not None:
            base_query = base_query.where(Task.priority == priority)

        if is_completed is not None:
            base_query = base_query.where(Task.is_completed == is_completed)

        if search:
            search_pattern = f"%{search}%"
            base_query = base_query.where(
                (Task.title.ilike(search_pattern))
                | (Task.description.ilike(search_pattern))
            )

        # Filter by tags (tasks that have ANY of the specified tags)
        if tag_ids:
            base_query = base_query.where(
                Task.id.in_(
                    select(TaskTag.task_id).where(TaskTag.tag_id.in_(tag_ids))
                )
            )

        # Filter by due date range
        if due_from is not None:
            base_query = base_query.where(Task.due_date >= due_from)

        if due_to is not None:
            base_query = base_query.where(Task.due_date <= due_to)

        # Get total count
        count_query = select(func.count()).select_from(base_query.subquery())
        total = self.session.exec(count_query).one()

        # Apply sorting
        sort_column = getattr(Task, sort_by, Task.created_at)
        if sort_order == "asc":
            base_query = base_query.order_by(sort_column.asc())
        else:
            base_query = base_query.order_by(sort_column.desc())

        # Apply pagination
        offset = (page - 1) * page_size
        base_query = base_query.offset(offset).limit(page_size)

        tasks = list(self.session.exec(base_query).all())
        return tasks, total

    def update(self, task: Task, **kwargs) -> Task:
        """Update a task with new values.

        Args:
            task: The task to update.
            **kwargs: Fields to update.

        Returns:
            The updated task.
        """
        for key, value in kwargs.items():
            if hasattr(task, key) and value is not None:
                setattr(task, key, value)

        task.updated_at = datetime.utcnow()
        self.session.add(task)
        self.session.flush()
        self.session.refresh(task)
        return task

    def complete(self, task: Task) -> Task:
        """Mark a task as completed.

        Args:
            task: The task to complete.

        Returns:
            The updated task.
        """
        task.is_completed = True
        task.completed_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()
        self.session.add(task)
        self.session.flush()
        self.session.refresh(task)
        return task

    def uncomplete(self, task: Task) -> Task:
        """Mark a task as incomplete.

        Args:
            task: The task to uncomplete.

        Returns:
            The updated task.
        """
        task.is_completed = False
        task.completed_at = None
        task.updated_at = datetime.utcnow()
        self.session.add(task)
        self.session.flush()
        self.session.refresh(task)
        return task

    def soft_delete(self, task: Task, deleted_by: str) -> Task:
        """Soft delete a task.

        Args:
            task: The task to delete.
            deleted_by: ID of the user who deleted the task.

        Returns:
            The updated task.
        """
        task.is_deleted = True
        task.deleted_at = datetime.utcnow()
        task.deleted_by = deleted_by
        task.updated_at = datetime.utcnow()
        self.session.add(task)
        self.session.flush()
        self.session.refresh(task)
        return task

    def restore(self, task: Task) -> Task:
        """Restore a soft-deleted task.

        Args:
            task: The task to restore.

        Returns:
            The updated task.
        """
        task.is_deleted = False
        task.deleted_at = None
        task.deleted_by = None
        task.updated_at = datetime.utcnow()
        self.session.add(task)
        self.session.flush()
        self.session.refresh(task)
        return task

    def count_for_user(
        self,
        user_id: str,
        *,
        include_completed: bool = True,
    ) -> int:
        """Count tasks for a user.

        Args:
            user_id: The user ID.
            include_completed: Whether to include completed tasks.

        Returns:
            Number of tasks.
        """
        query = (
            select(func.count())
            .select_from(Task)
            .where(Task.user_id == user_id)
            .where(Task.is_deleted == False)  # noqa: E712
        )

        if not include_completed:
            query = query.where(Task.is_completed == False)  # noqa: E712

        return self.session.exec(query).one()

    def get_overdue_tasks(self, user_id: str) -> list[Task]:
        """Get overdue tasks for a user.

        Args:
            user_id: The user ID.

        Returns:
            List of overdue tasks.
        """
        now = datetime.utcnow()
        statement = (
            select(Task)
            .where(Task.user_id == user_id)
            .where(Task.is_deleted == False)  # noqa: E712
            .where(Task.is_completed == False)  # noqa: E712
            .where(Task.due_date < now)
            .order_by(Task.due_date.asc())
        )
        return list(self.session.exec(statement).all())

    # --- Tag Association Methods ---

    def set_tags(self, task: Task, tag_ids: list[str], user_id: str) -> Task:
        """Set tags on a task, replacing any existing tags.

        Only tags owned by the user will be associated.

        Args:
            task: The task to update.
            tag_ids: List of tag IDs to associate.
            user_id: The user ID (for tag ownership verification).

        Returns:
            The updated task with refreshed tags.
        """
        # Remove all existing tag associations
        self._clear_tags(task)

        if tag_ids:
            # Verify tags exist and belong to user
            valid_tags = self._get_valid_tags(tag_ids, user_id)

            # Create new associations
            for tag in valid_tags:
                task_tag = TaskTag(task_id=task.id, tag_id=tag.id)
                self.session.add(task_tag)

        self.session.flush()
        self.session.refresh(task)
        return task

    def add_tags(self, task: Task, tag_ids: list[str], user_id: str) -> Task:
        """Add tags to a task without removing existing ones.

        Args:
            task: The task to update.
            tag_ids: List of tag IDs to add.
            user_id: The user ID (for tag ownership verification).

        Returns:
            The updated task with refreshed tags.
        """
        if not tag_ids:
            return task

        # Get existing tag IDs
        existing_tag_ids = {tag.id for tag in task.tags}

        # Filter out already-associated tags
        new_tag_ids = [tid for tid in tag_ids if tid not in existing_tag_ids]

        if new_tag_ids:
            valid_tags = self._get_valid_tags(new_tag_ids, user_id)

            for tag in valid_tags:
                task_tag = TaskTag(task_id=task.id, tag_id=tag.id)
                self.session.add(task_tag)

            self.session.flush()
            self.session.refresh(task)

        return task

    def remove_tags(self, task: Task, tag_ids: list[str]) -> Task:
        """Remove specific tags from a task.

        Args:
            task: The task to update.
            tag_ids: List of tag IDs to remove.

        Returns:
            The updated task with refreshed tags.
        """
        if not tag_ids:
            return task

        # Delete specific associations
        statement = (
            select(TaskTag)
            .where(TaskTag.task_id == task.id)
            .where(TaskTag.tag_id.in_(tag_ids))
        )
        task_tags = list(self.session.exec(statement).all())

        for task_tag in task_tags:
            self.session.delete(task_tag)

        self.session.flush()
        self.session.refresh(task)
        return task

    def _clear_tags(self, task: Task) -> None:
        """Remove all tag associations from a task.

        Args:
            task: The task to clear tags from.
        """
        statement = select(TaskTag).where(TaskTag.task_id == task.id)
        task_tags = list(self.session.exec(statement).all())

        for task_tag in task_tags:
            self.session.delete(task_tag)

    def _get_valid_tags(self, tag_ids: list[str], user_id: str) -> list[Tag]:
        """Get tags that exist and belong to the user.

        Args:
            tag_ids: List of tag IDs to validate.
            user_id: The user ID.

        Returns:
            List of valid Tag objects.
        """
        statement = (
            select(Tag)
            .where(Tag.id.in_(tag_ids))
            .where(Tag.user_id == user_id)
        )
        return list(self.session.exec(statement).all())
