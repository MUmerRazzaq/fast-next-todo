"""JWT verification middleware for FastAPI."""

from dataclasses import dataclass
from typing import Optional

from fastapi import HTTPException, Request, status
from jose import JWTError, jwt

from app.config import get_settings


@dataclass
class TokenPayload:
    """Decoded JWT token payload."""

    sub: str  # User ID
    email: Optional[str] = None
    iat: Optional[int] = None
    exp: Optional[int] = None


class JWTVerifier:
    """JWT token verification utility."""

    def __init__(self, secret: str, algorithm: str = "HS256"):
        self.secret = secret
        self.algorithm = algorithm

    def verify_token(self, token: str) -> TokenPayload:
        """Verify JWT token and extract payload.

        Args:
            token: JWT token string

        Returns:
            TokenPayload with decoded claims

        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            payload = jwt.decode(
                token,
                self.secret,
                algorithms=[self.algorithm],
            )

            sub = payload.get("sub")
            if not sub:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing subject claim",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            return TokenPayload(
                sub=sub,
                email=payload.get("email"),
                iat=payload.get("iat"),
                exp=payload.get("exp"),
            )

        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {e!s}",
                headers={"WWW-Authenticate": "Bearer"},
            ) from e


def extract_token_from_header(authorization: Optional[str]) -> str:
    """Extract Bearer token from Authorization header.

    Args:
        authorization: Authorization header value

    Returns:
        JWT token string

    Raises:
        HTTPException: If header is missing or malformed
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()

    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Use: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return parts[1]


def get_jwt_verifier() -> JWTVerifier:
    """Get configured JWT verifier instance."""
    settings = get_settings()
    return JWTVerifier(
        secret=settings.better_auth_secret,
        algorithm=settings.jwt_algorithm,
    )


async def verify_request_token(request: Request) -> TokenPayload:
    """Verify JWT token from request Authorization header.

    Args:
        request: FastAPI request object

    Returns:
        TokenPayload with decoded claims

    Raises:
        HTTPException: If authentication fails
    """
    authorization = request.headers.get("Authorization")
    token = extract_token_from_header(authorization)
    verifier = get_jwt_verifier()
    return verifier.verify_token(token)
