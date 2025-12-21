"""Vercel serverless entrypoint.

This module exposes the FastAPI application to Vercel's serverless
infrastructure via the Mangum ASGI adapter.
"""

from app.main import handler

# Vercel expects 'handler' to be exported at module level
# The handler is already defined in app/main.py using Mangum
__all__ = ["handler"]
