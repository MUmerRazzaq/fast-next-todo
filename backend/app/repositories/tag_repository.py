"""Tag repository for database operations.

Handles all tag-related database queries with user scoping.
"""

from typing import Optional
from uuid import uuid4

from sqlmodel import Session, func, select

from app.models.tag import Tag


class TagRepository:
    """Repository for tag database operations.

    All queries are scoped to the current user to ensure data isolation.
    """

    def __init__(self, session: Session) -> None:
        """Initialize with database session.

        Args:
            session: SQLAlchemy session for database operations.
        """
        self.session = session

    def create(self, user_id: str, name: str) -> Tag:
        """Create a new tag.

        Args:
            user_id: ID of the user who owns the tag.
            name: Tag name.

        Returns:
            The created tag.
        """
        tag = Tag(
            id=str(uuid4()),
            user_id=user_id,
            name=name,
        )
        self.session.add(tag)
        self.session.flush()
        self.session.refresh(tag)
        return tag

    def get_by_id(self, tag_id: str, user_id: str) -> Optional[Tag]:
        """Get a tag by ID for a specific user.

        Args:
            tag_id: The tag ID.
            user_id: The user ID (for ownership verification).

        Returns:
            The tag if found and owned by user, None otherwise.
        """
        statement = (
            select(Tag)
            .where(Tag.id == tag_id)
            .where(Tag.user_id == user_id)
        )
        return self.session.exec(statement).first()

    def exists_by_id(self, tag_id: str) -> bool:
        """Check if a tag exists by ID (regardless of owner).

        Used for ownership verification to distinguish between
        404 (not found) and 403 (forbidden) responses.

        Args:
            tag_id: The tag ID to check.

        Returns:
            True if tag exists, False otherwise.
        """
        statement = (
            select(func.count())
            .select_from(Tag)
            .where(Tag.id == tag_id)
        )
        count = self.session.exec(statement).one()
        return count > 0

    def get_by_name(self, user_id: str, name: str) -> Optional[Tag]:
        """Get a tag by name for a specific user (case-insensitive).

        Args:
            user_id: The user ID.
            name: The tag name.

        Returns:
            The tag if found, None otherwise.
        """
        statement = (
            select(Tag)
            .where(Tag.user_id == user_id)
            .where(func.lower(Tag.name) == func.lower(name))
        )
        return self.session.exec(statement).first()

    def list_for_user(
        self,
        user_id: str,
        *,
        page: int = 1,
        page_size: int = 50,
        search: Optional[str] = None,
    ) -> tuple[list[Tag], int]:
        """List tags for a user with pagination.

        Args:
            user_id: The user ID.
            page: Page number (1-indexed).
            page_size: Number of items per page.
            search: Optional search query for tag name.

        Returns:
            Tuple of (list of tags, total count).
        """
        # Base query with user filter
        base_query = select(Tag).where(Tag.user_id == user_id)

        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            base_query = base_query.where(Tag.name.ilike(search_pattern))

        # Get total count
        count_query = select(func.count()).select_from(base_query.subquery())
        total = self.session.exec(count_query).one()

        # Apply sorting (alphabetical by name)
        base_query = base_query.order_by(Tag.name.asc())

        # Apply pagination
        offset = (page - 1) * page_size
        base_query = base_query.offset(offset).limit(page_size)

        tags = list(self.session.exec(base_query).all())
        return tags, total

    def get_all_for_user(self, user_id: str) -> list[Tag]:
        """Get all tags for a user (no pagination).

        Args:
            user_id: The user ID.

        Returns:
            List of all tags for the user.
        """
        statement = (
            select(Tag)
            .where(Tag.user_id == user_id)
            .order_by(Tag.name.asc())
        )
        return list(self.session.exec(statement).all())

    def update(self, tag: Tag, name: str) -> Tag:
        """Update a tag's name.

        Args:
            tag: The tag to update.
            name: New tag name.

        Returns:
            The updated tag.
        """
        tag.name = name
        self.session.add(tag)
        self.session.flush()
        self.session.refresh(tag)
        return tag

    def delete(self, tag: Tag) -> None:
        """Delete a tag (hard delete).

        Note: This will cascade delete all task_tags associations.

        Args:
            tag: The tag to delete.
        """
        self.session.delete(tag)
        self.session.flush()

    def count_for_user(self, user_id: str) -> int:
        """Count tags for a user.

        Args:
            user_id: The user ID.

        Returns:
            Number of tags.
        """
        query = (
            select(func.count())
            .select_from(Tag)
            .where(Tag.user_id == user_id)
        )
        return self.session.exec(query).one()

    def get_by_ids(self, tag_ids: list[str], user_id: str) -> list[Tag]:
        """Get multiple tags by their IDs for a specific user.

        Args:
            tag_ids: List of tag IDs.
            user_id: The user ID.

        Returns:
            List of tags found (may be fewer than requested if some not found).
        """
        if not tag_ids:
            return []

        statement = (
            select(Tag)
            .where(Tag.id.in_(tag_ids))
            .where(Tag.user_id == user_id)
        )
        return list(self.session.exec(statement).all())
