import logging
import traceback
from fastapi import Request, status
from fastapi.responses import JSONResponse

from .exceptions import APIException
from .schemas import DevErrorResponse, ErrorResponse

# Assume logger is configured elsewhere, e.g., in logging_config.py
logger = logging.getLogger(__name__)

# A simple flag to determine the environment.
# In a real app, this would come from settings/environment variables.
IS_DEV_ENVIRONMENT = True


async def api_exception_handler(request: Request, exc: APIException):
    """Global handler for custom APIExceptions."""

    log_message = f"API Error: {exc.message} - Status: {exc.status_code}"
    if hasattr(exc, "detail") and exc.detail:
        log_message += f" - Detail: {exc.detail}"

    logger.error(log_message)

    if IS_DEV_ENVIRONMENT:
        response_content = DevErrorResponse(
            error=exc.user_message,
            details=getattr(exc, "detail", None),
            debug={"traceback": traceback.format_exc()},
        ).model_dump(exclude_none=True)
    else:
        response_content = ErrorResponse(
            error=exc.user_message, details=getattr(exc, "detail", None)
        ).model_dump(exclude_none=True)

    return JSONResponse(
        status_code=exc.status_code,
        content=response_content,
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    """Handler for any other unhandled exceptions."""
    logger.critical(f"Unhandled exception: {exc}", exc_info=True)

    if IS_DEV_ENVIRONMENT:
        response_content = DevErrorResponse(
            error="An unexpected internal server error occurred.",
            debug={
                "exception_type": type(exc).__name__,
                "traceback": traceback.format_exc(),
            },
        ).model_dump(exclude_none=True)
    else:
        response_content = ErrorResponse(
            error="An unexpected internal server error occurred."
        ).model_dump(exclude_none=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=response_content,
    )


def register_exception_handlers(app):
    """Registers the exception handlers with the FastAPI app."""
    app.add_exception_handler(APIException, api_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
