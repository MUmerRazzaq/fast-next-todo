"""Tag API endpoints.

Provides CRUD operations for tag management with user scoping.
"""

from typing import Optional

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUserId, conflict_error, forbidden_error, not_found_error
from app.database import SessionDep
from app.schemas.tag import (
    TagCreate,
    TagListResponse,
    TagResponse,
    TagUpdate,
)
from app.services.tag_service import TagAccessResult, TagService

router = APIRouter(prefix="/tags", tags=["tags"])


def get_tag_service(session) -> TagService:
    """Get tag service instance."""
    return TagService(session)


def raise_for_access_result(result: TagAccessResult, tag_id: str) -> None:
    """Raise appropriate exception for access result.

    Args:
        result: The access result from service layer.
        tag_id: The tag ID for error messages.

    Raises:
        HTTPException: 404 if not found, 403 if forbidden.
    """
    if result == TagAccessResult.NOT_FOUND:
        raise not_found_error("Tag", tag_id)
    elif result == TagAccessResult.FORBIDDEN:
        raise forbidden_error("tag")


@router.get("", response_model=TagListResponse)
async def list_tags(
    session: SessionDep,
    user_id: CurrentUserId,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, max_length=50, description="Search in tag name"),
) -> TagListResponse:
    """List tags for the current user.

    Supports searching by name and pagination.
    """
    service = get_tag_service(session)
    tags, total = service.list_tags(
        user_id=user_id,
        page=page,
        page_size=page_size,
        search=search,
    )

    total_pages = (total + page_size - 1) // page_size

    return TagListResponse(
        items=[TagResponse.model_validate(tag) for tag in tags],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    session: SessionDep,
    user_id: CurrentUserId,
    data: TagCreate,
) -> TagResponse:
    """Create a new tag.

    The tag is automatically associated with the current user.
    Tag names must be unique per user (case-insensitive).
    """
    service = get_tag_service(session)

    try:
        tag = service.create_tag(user_id=user_id, data=data)
        session.commit()
        return TagResponse.model_validate(tag)
    except ValueError as e:
        raise conflict_error(str(e))


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(
    session: SessionDep,
    user_id: CurrentUserId,
    tag_id: str,
) -> TagResponse:
    """Get a specific tag by ID.

    Only returns tags owned by the current user.
    Returns 404 if tag doesn't exist, 403 if user doesn't own it.
    """
    service = get_tag_service(session)
    access_result, tag = service.get_tag_with_access_check(
        tag_id=tag_id, user_id=user_id
    )

    raise_for_access_result(access_result, tag_id)

    return TagResponse.model_validate(tag)


@router.patch("/{tag_id}", response_model=TagResponse)
async def update_tag(
    session: SessionDep,
    user_id: CurrentUserId,
    tag_id: str,
    data: TagUpdate,
) -> TagResponse:
    """Update a tag.

    Tag names must be unique per user (case-insensitive).
    Returns 404 if tag doesn't exist, 403 if user doesn't own it.
    """
    service = get_tag_service(session)

    try:
        access_result, tag = service.update_tag(
            tag_id=tag_id, user_id=user_id, data=data
        )
        raise_for_access_result(access_result, tag_id)
        session.commit()
        return TagResponse.model_validate(tag)
    except ValueError as e:
        raise conflict_error(str(e))


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    session: SessionDep,
    user_id: CurrentUserId,
    tag_id: str,
) -> None:
    """Delete a tag.

    This is a hard delete - the tag will be permanently removed.
    All task-tag associations will also be removed.
    Returns 404 if tag doesn't exist, 403 if user doesn't own it.
    """
    service = get_tag_service(session)
    access_result = service.delete_tag(tag_id=tag_id, user_id=user_id)

    raise_for_access_result(access_result, tag_id)

    session.commit()
