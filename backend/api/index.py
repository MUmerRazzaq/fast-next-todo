"""Vercel serverless entrypoint.

This module exposes the FastAPI application to Vercel's serverless
infrastructure via the Mangum ASGI adapter.
"""

from mangum import Mangum
from app.main import app

# Vercel expects 'handler' to be exported at module level
# The handler is already defined in app/main.py using Mangum
handler = Mangum(app, lifespan="off")

# Vercel expects 'app' to be exported at module level (for FastAPI detection)
# and 'handler' for the actual ASGI application.
# By making `app` available at this level, Vercel might recognize it.
__all__ = ["app", "handler"]
