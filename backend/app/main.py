"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from typing import Any

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    # Startup
    settings = get_settings()
    if settings.debug:
        print(f"Starting {settings.app_name} v{settings.app_version}")
        print(f"Environment: {settings.environment}")
        print(f"Frontend URL: {settings.frontend_url}")

    yield

    # Shutdown
    if settings.debug:
        print("Shutting down...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Backend API for Fast Next Todo - Intelligent Multi-User Task Management",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        openapi_url="/openapi.json" if settings.debug else None,
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url] + settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add rate limiting middleware
    from app.middleware.rate_limit import RateLimitMiddleware

    app.add_middleware(RateLimitMiddleware)

    # Register API routers
    from app.api.v1 import health, tags, tasks

    api_router = APIRouter(prefix="/api/v1")
    api_router.include_router(health.router, tags=["Health"])
    api_router.include_router(tasks.router, tags=["Tasks"])
    api_router.include_router(tags.router, tags=["Tags"])

    app.include_router(api_router)

    return app


# Create application instance
app = create_app()


# Root endpoint
@app.get("/")
async def root() -> dict[str, Any]:
    """Root endpoint returning API information."""
    settings = get_settings()
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs" if settings.debug else "Disabled in production",
    }


# Vercel serverless handler
handler = Mangum(app, lifespan="off")
