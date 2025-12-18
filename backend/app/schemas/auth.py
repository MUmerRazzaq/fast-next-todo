"""Authentication-related Pydantic schemas.

These schemas are used for auth-related API responses.
Note: Better Auth handles the actual auth flow on the frontend.
These schemas are for backend responses that need user context.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr
    name: Optional[str] = None


class UserResponse(BaseModel):
    """User information response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    name: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class SessionResponse(BaseModel):
    """Session information response schema."""

    model_config = ConfigDict(from_attributes=True)

    user: UserResponse
    expires_at: datetime


class TokenInfo(BaseModel):
    """Token information from JWT verification."""

    sub: str = Field(..., description="User ID from JWT subject claim")
    email: Optional[str] = None
    exp: Optional[int] = None
    iat: Optional[int] = None


class AuthStatusResponse(BaseModel):
    """Auth status check response."""

    authenticated: bool
    user: Optional[UserResponse] = None


class SignInRequest(BaseModel):
    """Sign in request schema (for documentation purposes)."""

    email: EmailStr
    password: str = Field(..., min_length=8)


class SignUpRequest(BaseModel):
    """Sign up request schema (for documentation purposes)."""

    email: EmailStr
    password: str = Field(..., min_length=8)
    name: Optional[str] = Field(None, max_length=100)


class PasswordResetRequest(BaseModel):
    """Password reset request schema."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema."""

    token: str
    new_password: str = Field(..., min_length=8)
