"""Health check endpoint for monitoring and load balancers."""

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, status
from pydantic import BaseModel

from app.config import get_settings

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: Literal["healthy", "unhealthy"]
    timestamp: datetime
    version: str
    environment: str


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check if the API is running and healthy.",
)
async def health_check() -> HealthResponse:
    """Return current health status of the API."""
    settings = get_settings()

    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=settings.app_version,
        environment=settings.environment,
    )
