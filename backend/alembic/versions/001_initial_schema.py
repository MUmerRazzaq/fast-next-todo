"""Initial schema - create tasks, tags, task_tags, and audit_logs tables.

Revision ID: 001
Revises:
Create Date: 2025-12-15

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial database schema."""

    # Create tasks table
    op.create_table(
        "tasks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), nullable=False, index=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.String(2000), nullable=True),
        sa.Column(
            "priority",
            sa.Enum("low", "medium", "high", name="priority"),
            nullable=False,
            server_default="medium",
        ),
        sa.Column("due_date", sa.DateTime, nullable=True, index=True),
        sa.Column(
            "recurrence",
            sa.Enum("none", "daily", "weekly", "monthly", name="recurrence"),
            nullable=False,
            server_default="none",
        ),
        sa.Column("is_completed", sa.Boolean, nullable=False, default=False, index=True),
        sa.Column("completed_at", sa.DateTime, nullable=True),
        sa.Column("is_deleted", sa.Boolean, nullable=False, default=False, index=True),
        sa.Column("deleted_at", sa.DateTime, nullable=True),
        sa.Column("deleted_by", sa.String(36), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    # Create tags table
    op.create_table(
        "tags",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), nullable=False, index=True),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.func.now(),
        ),
        # Unique constraint: tag name must be unique per user
        sa.UniqueConstraint("user_id", "name", name="uq_tags_user_name"),
    )

    # Create task_tags junction table (many-to-many)
    op.create_table(
        "task_tags",
        sa.Column("task_id", sa.String(36), sa.ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("tag_id", sa.String(36), sa.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # Create audit_logs table (append-only)
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("entity_type", sa.String(50), nullable=False, index=True),
        sa.Column("entity_id", sa.String(36), nullable=False, index=True),
        sa.Column("user_id", sa.String(36), nullable=False, index=True),
        sa.Column(
            "action_type",
            sa.Enum(
                "create",
                "update",
                "complete",
                "uncomplete",
                "delete",
                "recurring_auto_create",
                name="actiontype",
            ),
            nullable=False,
        ),
        sa.Column("field_changed", sa.String(50), nullable=True),
        sa.Column("old_value", sa.String(2000), nullable=True),
        sa.Column("new_value", sa.String(2000), nullable=True),
        sa.Column(
            "timestamp",
            sa.DateTime,
            nullable=False,
            server_default=sa.func.now(),
            index=True,
        ),
        sa.Column("is_system_action", sa.Boolean, nullable=False, default=False),
    )

    # Create indexes for common queries
    op.create_index(
        "ix_tasks_user_completed",
        "tasks",
        ["user_id", "is_completed"],
    )
    op.create_index(
        "ix_tasks_user_deleted",
        "tasks",
        ["user_id", "is_deleted"],
    )
    op.create_index(
        "ix_audit_logs_entity",
        "audit_logs",
        ["entity_type", "entity_id"],
    )


def downgrade() -> None:
    """Drop all tables."""
    # Drop indexes
    op.drop_index("ix_audit_logs_entity", table_name="audit_logs")
    op.drop_index("ix_tasks_user_deleted", table_name="tasks")
    op.drop_index("ix_tasks_user_completed", table_name="tasks")

    # Drop tables in reverse order (respect foreign keys)
    op.drop_table("audit_logs")
    op.drop_table("task_tags")
    op.drop_table("tags")
    op.drop_table("tasks")

    # Drop enums
    op.execute("DROP TYPE IF EXISTS actiontype")
    op.execute("DROP TYPE IF EXISTS recurrence")
    op.execute("DROP TYPE IF EXISTS priority")
