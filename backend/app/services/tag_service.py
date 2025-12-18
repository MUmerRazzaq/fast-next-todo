"""Tag service for business logic.

Handles all tag-related business operations including CRUD
and audit logging.
"""

from enum import Enum
from typing import Optional

from sqlmodel import Session

from app.models.tag import Tag
from app.repositories.tag_repository import TagRepository
from app.schemas.tag import TagCreate, TagUpdate
from app.services.audit_service import AuditService


class TagAccessResult(str, Enum):
    """Result of a tag access check."""

    SUCCESS = "success"
    NOT_FOUND = "not_found"
    FORBIDDEN = "forbidden"


class TagService:
    """Service for tag business operations.

    Encapsulates all tag-related business logic and coordinates
    between the repository and audit service.
    """

    def __init__(self, session: Session) -> None:
        """Initialize with database session.

        Args:
            session: SQLAlchemy session for database operations.
        """
        self.session = session
        self.repository = TagRepository(session)
        self.audit_service = AuditService(session)

    def get_tag_with_access_check(
        self, tag_id: str, user_id: str
    ) -> tuple[TagAccessResult, Optional[Tag]]:
        """Get a tag with explicit access verification.

        This method distinguishes between:
        - Tag not found (404)
        - Tag exists but belongs to another user (403)
        - Tag found and accessible (200)

        Args:
            tag_id: The tag ID.
            user_id: The user ID from JWT token.

        Returns:
            Tuple of (access result, tag or None).
        """
        # First, check if the tag exists at all
        if not self.repository.exists_by_id(tag_id):
            return (TagAccessResult.NOT_FOUND, None)

        # Tag exists, check if user owns it
        tag = self.repository.get_by_id(tag_id, user_id)
        if not tag:
            # Tag exists but belongs to another user
            return (TagAccessResult.FORBIDDEN, None)

        return (TagAccessResult.SUCCESS, tag)

    def create_tag(self, user_id: str, data: TagCreate) -> Tag:
        """Create a new tag.

        Args:
            user_id: ID of the user creating the tag.
            data: Tag creation data.

        Returns:
            The created tag.

        Raises:
            ValueError: If tag name already exists for this user.
        """
        # Check for duplicate name (case-insensitive)
        existing = self.repository.get_by_name(user_id, data.name)
        if existing:
            raise ValueError(f"Tag with name '{data.name}' already exists")

        tag = self.repository.create(user_id=user_id, name=data.name)

        # Log creation
        self.audit_service.log_create(
            entity_type="tag",
            entity_id=tag.id,
            user_id=user_id,
            entity_data={"name": tag.name},
        )

        return tag

    def get_tag(self, tag_id: str, user_id: str) -> Optional[Tag]:
        """Get a tag by ID for a specific user.

        Args:
            tag_id: The tag ID.
            user_id: The user ID.

        Returns:
            The tag if found and owned by user, None otherwise.
        """
        return self.repository.get_by_id(tag_id, user_id)

    def list_tags(
        self,
        user_id: str,
        *,
        page: int = 1,
        page_size: int = 50,
        search: Optional[str] = None,
    ) -> tuple[list[Tag], int]:
        """List tags for a user with filtering and pagination.

        Args:
            user_id: The user ID.
            page: Page number.
            page_size: Items per page.
            search: Search query.

        Returns:
            Tuple of (tags, total count).
        """
        return self.repository.list_for_user(
            user_id=user_id,
            page=page,
            page_size=page_size,
            search=search,
        )

    def get_all_tags(self, user_id: str) -> list[Tag]:
        """Get all tags for a user (no pagination).

        Args:
            user_id: The user ID.

        Returns:
            List of all tags for the user.
        """
        return self.repository.get_all_for_user(user_id)

    def update_tag(
        self, tag_id: str, user_id: str, data: TagUpdate
    ) -> tuple[TagAccessResult, Optional[Tag]]:
        """Update a tag.

        Args:
            tag_id: The tag ID.
            user_id: The user ID.
            data: Update data.

        Returns:
            Tuple of (access result, updated tag or None).

        Raises:
            ValueError: If new name already exists for this user.
        """
        access_result, tag = self.get_tag_with_access_check(tag_id, user_id)
        if access_result != TagAccessResult.SUCCESS or not tag:
            return (access_result, None)

        if data.name:
            # Check for duplicate name (excluding current tag)
            existing = self.repository.get_by_name(user_id, data.name)
            if existing and existing.id != tag_id:
                raise ValueError(f"Tag with name '{data.name}' already exists")

            old_name = tag.name
            tag = self.repository.update(tag, name=data.name)

            # Log update
            self.audit_service.log_updates(
                entity_type="tag",
                entity_id=tag.id,
                user_id=user_id,
                changes={"name": (old_name, data.name)},
            )

        return (TagAccessResult.SUCCESS, tag)

    def delete_tag(self, tag_id: str, user_id: str) -> TagAccessResult:
        """Delete a tag (hard delete).

        Args:
            tag_id: The tag ID.
            user_id: The user ID.

        Returns:
            TagAccessResult indicating success, not_found, or forbidden.
        """
        access_result, tag = self.get_tag_with_access_check(tag_id, user_id)
        if access_result != TagAccessResult.SUCCESS or not tag:
            return access_result

        self.repository.delete(tag)

        # Log deletion
        self.audit_service.log_delete(
            entity_type="tag",
            entity_id=tag_id,
            user_id=user_id,
            soft_delete=False,
        )

        return TagAccessResult.SUCCESS

    def get_tag_count(self, user_id: str) -> int:
        """Get the total tag count for a user.

        Args:
            user_id: The user ID.

        Returns:
            Number of tags.
        """
        return self.repository.count_for_user(user_id)
