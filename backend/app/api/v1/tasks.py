"""Task API endpoints.

Provides CRUD operations for task management with user scoping.
"""

import csv
import io
import json
from datetime import datetime
from typing import Literal, Optional

from fastapi import APIRouter, Query, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from app.api.deps import CurrentUserId, forbidden_error, not_found_error
from app.database import SessionDep
from app.models.task import Priority
from app.schemas.task import (
    CompleteTaskResponse,
    TaskCreate,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)
from app.schemas.audit import AuditLogListResponse, AuditLogResponse
from app.services.task_service import TaskAccessResult, TaskService
from app.repositories.audit_repository import AuditRepository

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_task_service(session: Session) -> TaskService:
    """Get task service instance."""
    return TaskService(session)


def raise_for_access_result(result: TaskAccessResult, task_id: str) -> None:
    """Raise appropriate exception for access result.

    Args:
        result: The access result from service layer.
        task_id: The task ID for error messages.

    Raises:
        HTTPException: 404 if not found, 403 if forbidden.
    """
    if result == TaskAccessResult.NOT_FOUND:
        raise not_found_error("Task", task_id)
    elif result == TaskAccessResult.FORBIDDEN:
        raise forbidden_error("task")


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    session: SessionDep,
    user_id: CurrentUserId,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    priority: Optional[Priority] = Query(None, description="Filter by priority"),
    is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
    search: Optional[str] = Query(None, max_length=100, description="Search in title/description"),
    tag_ids: Optional[str] = Query(None, description="Comma-separated tag IDs to filter by"),
    due_from: Optional[datetime] = Query(None, description="Filter tasks with due date >= this"),
    due_to: Optional[datetime] = Query(None, description="Filter tasks with due date <= this"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort direction"),
) -> TaskListResponse:
    """List tasks for the current user.

    Supports filtering by priority, completion status, tags, and due date range.
    Searching in title and description, and pagination.
    """
    # Parse comma-separated tag_ids into list
    tag_ids_list: Optional[list[str]] = None
    if tag_ids:
        tag_ids_list = [tid.strip() for tid in tag_ids.split(",") if tid.strip()]

    service = get_task_service(session)
    tasks, total = service.list_tasks(
        user_id=user_id,
        page=page,
        page_size=page_size,
        priority=priority,
        is_completed=is_completed,
        search=search,
        tag_ids=tag_ids_list,
        due_from=due_from,
        due_to=due_to,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    total_pages = (total + page_size - 1) // page_size

    return TaskListResponse(
        items=[TaskResponse.model_validate(task) for task in tasks],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    session: SessionDep,
    user_id: CurrentUserId,
    data: TaskCreate,
) -> TaskResponse:
    """Create a new task.

    The task is automatically associated with the current user.
    """
    service = get_task_service(session)
    task = service.create_task(user_id=user_id, data=data)
    session.commit()
    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    session: SessionDep,
    user_id: CurrentUserId,
    task_id: str,
) -> TaskResponse:
    """Get a specific task by ID.

    Only returns tasks owned by the current user.
    Returns 404 if task doesn't exist, 403 if user doesn't own it.
    """
    service = get_task_service(session)
    access_result, task = service.get_task_with_access_check(
        task_id=task_id, user_id=user_id
    )

    raise_for_access_result(access_result, task_id)

    # At this point, task is guaranteed to be non-None
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    session: SessionDep,
    user_id: CurrentUserId,
    task_id: str,
    data: TaskUpdate,
) -> TaskResponse:
    """Update a task.

    Supports partial updates - only provided fields are modified.
    Returns 404 if task doesn't exist, 403 if user doesn't own it.
    """
    service = get_task_service(session)
    access_result, task = service.update_task(
        task_id=task_id, user_id=user_id, data=data
    )

    raise_for_access_result(access_result, task_id)

    session.commit()
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    session: SessionDep,
    user_id: CurrentUserId,
    task_id: str,
) -> None:
    """Soft delete a task.

    The task is marked as deleted but remains in the database for audit purposes.
    Returns 404 if task doesn't exist, 403 if user doesn't own it.
    """
    service = get_task_service(session)
    access_result = service.delete_task(task_id=task_id, user_id=user_id)

    raise_for_access_result(access_result, task_id)

    session.commit()


@router.post("/{task_id}/complete", response_model=CompleteTaskResponse)
async def complete_task(
    session: SessionDep,
    user_id: CurrentUserId,
    task_id: str,
) -> CompleteTaskResponse:
    """Mark a task as completed.

    If the task has a recurrence pattern, a new task is automatically
    created with the next due date.
    Returns 404 if task doesn't exist, 403 if user doesn't own it.
    """
    service = get_task_service(session)
    access_result, result = service.complete_task(task_id=task_id, user_id=user_id)

    raise_for_access_result(access_result, task_id)

    # At this point, result is guaranteed to be non-None
    completed_task, next_task = result  # type: ignore
    session.commit()

    response = CompleteTaskResponse.model_validate(completed_task)
    if next_task:
        response.next_task = TaskResponse.model_validate(next_task)

    return response


@router.post("/{task_id}/uncomplete", response_model=TaskResponse)
async def uncomplete_task(
    session: SessionDep,
    user_id: CurrentUserId,
    task_id: str,
) -> TaskResponse:
    """Mark a completed task as incomplete.

    Returns 404 if task doesn't exist, 403 if user doesn't own it.
    """
    service = get_task_service(session)
    access_result, task = service.uncomplete_task(task_id=task_id, user_id=user_id)

    raise_for_access_result(access_result, task_id)

    session.commit()
    return TaskResponse.model_validate(task)


@router.get("/export/download")
async def export_tasks(
    session: SessionDep,
    user_id: CurrentUserId,
    format: Literal["csv", "json"] = Query("csv", description="Export format"),
    is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
) -> StreamingResponse:
    """Export tasks to CSV or JSON format.

    Streams the export data for efficient handling of large task lists.
    """
    service = get_task_service(session)

    # Get all tasks for the user (no pagination for export)
    tasks, _ = service.list_tasks(
        user_id=user_id,
        page=1,
        page_size=10000,  # Large limit to get all tasks
        is_completed=is_completed,
        sort_by="created_at",
        sort_order="desc",
    )

    if format == "json":
        # Export as JSON
        def generate_json():
            task_data = []
            for task in tasks:
                task_dict = {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority.value if task.priority else "medium",
                    "is_completed": task.is_completed,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "recurrence": task.recurrence.value if task.recurrence else "none",
                    "tags": [{"id": tag.id, "name": tag.name, "color": tag.color} for tag in task.tags],
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                    "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                }
                task_data.append(task_dict)
            yield json.dumps(task_data, indent=2)

        return StreamingResponse(
            generate_json(),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=tasks.json"},
        )
    else:
        # Export as CSV
        def generate_csv():
            output = io.StringIO()
            writer = csv.writer(output)

            # Write header
            writer.writerow([
                "ID", "Title", "Description", "Priority", "Is Completed",
                "Due Date", "Recurrence", "Tags", "Created At", "Updated At", "Completed At"
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate()

            # Write rows
            for task in tasks:
                tag_names = ", ".join(tag.name for tag in task.tags) if task.tags else ""
                writer.writerow([
                    task.id,
                    task.title,
                    task.description or "",
                    task.priority.value if task.priority else "medium",
                    "Yes" if task.is_completed else "No",
                    task.due_date.isoformat() if task.due_date else "",
                    task.recurrence.value if task.recurrence else "none",
                    tag_names,
                    task.created_at.isoformat() if task.created_at else "",
                    task.updated_at.isoformat() if task.updated_at else "",
                    task.completed_at.isoformat() if task.completed_at else "",
                ])
                yield output.getvalue()
                output.seek(0)
                output.truncate()

        return StreamingResponse(
            generate_csv(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=tasks.csv"},
        )


@router.get("/{task_id}/audit", response_model=AuditLogListResponse)
async def get_task_audit_log(
    session: SessionDep,
    user_id: CurrentUserId,
    task_id: str,
    limit: int = Query(50, ge=1, le=100, description="Maximum number of entries"),
    offset: int = Query(0, ge=0, description="Number of entries to skip"),
) -> AuditLogListResponse:
    """Get the audit log for a specific task.

    Returns the change history for the task, including who made changes
    and what was changed.
    Returns 404 if task doesn't exist, 403 if user doesn't own it.
    """
    # First verify the user has access to the task
    service = get_task_service(session)
    access_result, _ = service.get_task_with_access_check(
        task_id=task_id, user_id=user_id
    )

    raise_for_access_result(access_result, task_id)

    # Get audit logs for the task
    audit_repo = AuditRepository(session)
    logs = audit_repo.get_by_entity(
        entity_type="task",
        entity_id=task_id,
        limit=limit,
        offset=offset,
    )
    total = audit_repo.count_by_entity(entity_type="task", entity_id=task_id)

    return AuditLogListResponse(
        items=[AuditLogResponse.model_validate(log) for log in logs],
        total=total,
    )
