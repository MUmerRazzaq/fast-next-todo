from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom validation exception handler for FastAPI.
    Returns a 422 Unprocessable Entity response with a simplified error structure.
    """
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        errors.append({
            "field": field,
            "message": error["msg"]
        })
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation Error", "errors": errors},
    )
