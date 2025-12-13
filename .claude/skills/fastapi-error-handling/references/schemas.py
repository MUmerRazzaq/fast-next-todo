from pydantic import BaseModel, Field
from typing import Optional, Any

class ErrorResponse(BaseModel):
    """Standardized error response schema."""
    error: str = Field(..., description="A user-friendly error message.")
    details: Optional[Any] = Field(None, description="Optional detailed error information.")

class DevErrorResponse(ErrorResponse):
    """Error response schema for development environments, including debug info."""
    debug: Optional[dict] = Field(None, description="Debugging information, like stack traces.")
