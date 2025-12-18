"""Database connection and session management for Neon PostgreSQL."""

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlmodel import Session

from app.config import Settings, get_settings


def create_db_engine(settings: Settings):
    """Create database engine configured for serverless (Neon)."""
    return create_engine(
        settings.database_url_with_driver,
        # NullPool is required for serverless - connections are managed by Neon pooler
        poolclass=NullPool,
        # Verify connection is alive before using
        pool_pre_ping=True,
        # Enable SQL echo in development
        echo=settings.debug,
    )


# Global engine instance (created lazily)
_engine = None


def get_engine():
    """Get or create the database engine."""
    global _engine
    if _engine is None:
        _engine = create_db_engine(get_settings())
    return _engine


def get_session() -> Generator[Session, None, None]:
    """Get a database session for dependency injection."""
    engine = get_engine()
    with Session(engine) as session:
        yield session


# Type alias for dependency injection
SessionDep = Annotated[Session, Depends(get_session)]
