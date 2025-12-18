"""FastAPI dependencies for dependency injection."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session

from app.database import SessionDep, get_session
from app.middleware.auth import (
    JWTVerifier,
    TokenPayload,
    extract_token_from_header,
    get_jwt_verifier,
)
from app.services.audit_service import AuditService


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    verifier: JWTVerifier = Depends(get_jwt_verifier),
) -> TokenPayload:
    """Get current authenticated user from JWT token.

    This dependency extracts and verifies the JWT token from the
    Authorization header and returns the decoded token payload.

    Args:
        authorization: Authorization header value
        verifier: JWT verifier instance

    Returns:
        TokenPayload with user information

    Raises:
        HTTPException: If authentication fails
    """
    token = extract_token_from_header(authorization)
    return verifier.verify_token(token)


async def get_current_user_id(
    current_user: Annotated[TokenPayload, Depends(get_current_user)],
) -> str:
    """Get current user ID from authenticated request.

    Convenience dependency that returns just the user ID string.

    Args:
        current_user: Decoded token payload

    Returns:
        User ID string
    """
    return current_user.sub


# Type aliases for dependency injection
CurrentUser = Annotated[TokenPayload, Depends(get_current_user)]
CurrentUserId = Annotated[str, Depends(get_current_user_id)]


def get_audit_service(session: Session = Depends(get_session)) -> AuditService:
    """Get audit service instance.

    Args:
        session: Database session from dependency injection.

    Returns:
        AuditService instance for logging mutations.
    """
    return AuditService(session)


# Type alias for audit service dependency
AuditServiceDep = Annotated[AuditService, Depends(get_audit_service)]


def verify_resource_ownership(
    resource_user_id: str,
    current_user_id: str,
    resource_type: str = "resource",
) -> None:
    """Verify that the current user owns the resource.

    Args:
        resource_user_id: User ID who owns the resource
        current_user_id: Current authenticated user ID
        resource_type: Type of resource for error message

    Raises:
        HTTPException: If user does not own the resource
    """
    if resource_user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: you do not own this {resource_type}",
        )


# --- Error Response Helpers ---


def not_found_error(resource_type: str, resource_id: str) -> HTTPException:
    """Create a 404 Not Found error response.

    Args:
        resource_type: Type of resource (e.g., "task", "tag")
        resource_id: ID of the resource

    Returns:
        HTTPException with 404 status
    """
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource_type.capitalize()} with id '{resource_id}' not found",
    )


def validation_error(message: str) -> HTTPException:
    """Create a 400 Bad Request error response.

    Args:
        message: Error message describing the validation failure

    Returns:
        HTTPException with 400 status
    """
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message,
    )


def conflict_error(message: str) -> HTTPException:
    """Create a 409 Conflict error response.

    Args:
        message: Error message describing the conflict

    Returns:
        HTTPException with 409 status
    """
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=message,
    )


def forbidden_error(resource_type: str) -> HTTPException:
    """Create a 403 Forbidden error response.

    Args:
        resource_type: Type of resource (e.g., "task", "tag")

    Returns:
        HTTPException with 403 status
    """
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Access denied: you do not have permission to access this {resource_type}",
    )
