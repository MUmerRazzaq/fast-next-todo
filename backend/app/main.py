"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from typing import Any

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    # Startup
    settings = get_settings()
    if settings.debug:
        print(f"Starting {settings.app_name} v{settings.app_version}")
        print(f"Environment: {settings.environment}")
        print(f"CORS Origins: {settings.cors_origins}")

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

    # Middleware is executed in LIFO order (last added runs first)
    # We want: Request -> CORS -> RateLimit -> Route Handler
    # So we add RateLimit first, then CORS

    # Add rate limiting middleware (runs AFTER CORS due to LIFO)
    from app.middleware.rate_limit import RateLimitMiddleware

    app.add_middleware(RateLimitMiddleware)

    # Configure CORS (runs FIRST due to LIFO - handles OPTIONS preflight)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"],
    )

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

