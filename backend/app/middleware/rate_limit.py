"""Rate limiting middleware for API protection."""

import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Callable

from fastapi import HTTPException, Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings


@dataclass
class RateLimitBucket:
    """Sliding window rate limit bucket."""

    requests: list[float] = field(default_factory=list)

    def add_request(self, timestamp: float, window_seconds: int) -> None:
        """Add a request timestamp and clean old entries."""
        cutoff = timestamp - window_seconds
        self.requests = [t for t in self.requests if t > cutoff]
        self.requests.append(timestamp)

    def count(self, window_seconds: int) -> int:
        """Count requests within the window."""
        cutoff = time.time() - window_seconds
        return sum(1 for t in self.requests if t > cutoff)


class RateLimiter:
    """In-memory sliding window rate limiter.

    Tracks request counts per identifier (user ID or IP address)
    and enforces configurable rate limits.
    """

    def __init__(
        self,
        requests_per_minute: int = 100,
        window_seconds: int = 60,
    ):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = window_seconds
        self.buckets: dict[str, RateLimitBucket] = defaultdict(RateLimitBucket)

    def is_allowed(self, identifier: str) -> tuple[bool, int]:
        """Check if request is allowed and return remaining quota.

        Args:
            identifier: User ID or IP address

        Returns:
            Tuple of (is_allowed, remaining_requests)
        """
        now = time.time()
        bucket = self.buckets[identifier]

        # Clean and count existing requests
        current_count = bucket.count(self.window_seconds)

        if current_count >= self.requests_per_minute:
            return False, 0

        # Add this request
        bucket.add_request(now, self.window_seconds)

        return True, self.requests_per_minute - current_count - 1

    def get_retry_after(self, identifier: str) -> int:
        """Get seconds until the oldest request expires.

        Args:
            identifier: User ID or IP address

        Returns:
            Seconds until rate limit resets
        """
        bucket = self.buckets.get(identifier)
        if not bucket or not bucket.requests:
            return 0

        oldest = min(bucket.requests)
        return max(1, int(self.window_seconds - (time.time() - oldest)))


# Global rate limiters for different endpoint categories
_general_limiter: RateLimiter | None = None
_auth_limiter: RateLimiter | None = None


def get_general_limiter() -> RateLimiter:
    """Get general rate limiter instance."""
    global _general_limiter
    if _general_limiter is None:
        settings = get_settings()
        _general_limiter = RateLimiter(
            requests_per_minute=settings.rate_limit_requests_per_minute,
        )
    return _general_limiter


def get_auth_limiter() -> RateLimiter:
    """Get auth-specific rate limiter instance."""
    global _auth_limiter
    if _auth_limiter is None:
        settings = get_settings()
        _auth_limiter = RateLimiter(
            requests_per_minute=settings.rate_limit_auth_requests_per_minute,
        )
    return _auth_limiter


def check_rate_limit(
    identifier: str,
    limiter: RateLimiter | None = None,
) -> None:
    """Check rate limit and raise exception if exceeded.

    Args:
        identifier: User ID or IP address
        limiter: Rate limiter instance (defaults to general limiter)

    Raises:
        HTTPException: 429 Too Many Requests if limit exceeded
    """
    if limiter is None:
        limiter = get_general_limiter()

    allowed, remaining = limiter.is_allowed(identifier)

    if not allowed:
        retry_after = limiter.get_retry_after(identifier)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please wait before trying again.",
            headers={"Retry-After": str(retry_after)},
        )


class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for rate limiting.

    Applies rate limits based on:
    - User ID (from JWT) for authenticated requests
    - IP address for unauthenticated requests
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Response],
    ) -> Response:
        """Process request with rate limiting."""
        # Skip rate limiting for OPTIONS preflight requests (CORS)
        # OPTIONS requests don't carry auth headers and must pass through
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip rate limiting for health checks
        if request.url.path.endswith("/health"):
            return await call_next(request)

        # Determine identifier (prefer user ID, fall back to IP)
        identifier = self._get_identifier(request)

        # Choose limiter based on endpoint
        if "/auth" in request.url.path:
            limiter = get_auth_limiter()
        else:
            limiter = get_general_limiter()

        # Check rate limit
        allowed, remaining = limiter.is_allowed(identifier)

        if not allowed:
            retry_after = limiter.get_retry_after(identifier)
            return Response(
                content='{"detail": "Too many requests. Please wait."}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json",
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(limiter.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                },
            )

        # Process request and add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limiter.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response

    def _get_identifier(self, request: Request) -> str:
        """Extract identifier from request.

        Uses user ID from JWT if available, otherwise client IP.
        """
        # Try to get user ID from auth header
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            # For rate limiting, we use a simple hash of the token
            # (actual user ID extraction happens in auth middleware)
            return f"user:{hash(auth_header)}"

        # Fall back to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return f"ip:{forwarded.split(',')[0].strip()}"

        client = request.client
        if client:
            return f"ip:{client.host}"

        return "ip:unknown"
