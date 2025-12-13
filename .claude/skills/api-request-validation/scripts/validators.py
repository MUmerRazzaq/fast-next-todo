import re
from pydantic import validator

def validate_email(cls, v: str) -> str:
    """Validate that a string is a valid email address."""
    if not re.match(r"[^@]+@[^@]+\.[^@]+", v):
        raise ValueError('Invalid email address')
    return v

def validate_password_strength(cls, v: str) -> str:
    """
    Validates that a password is at least 8 characters long and contains
    at least one number and one letter.
    """
    if len(v) < 8:
        raise ValueError('Password must be at least 8 characters long')
    if not any(c.isdigit() for c in v):
        raise ValueError('Password must contain at least one number')
    if not any(c.isalpha() for c in v):
        raise ValueError('Password must contain at least one letter')
    return v

# Example of how to use these in a Pydantic model:
#
# from pydantic import BaseModel, validator
#
# class UserRegistration(BaseModel):
#     email: str
#     password: str
#
#     _validate_email = validator('email', allow_reuse=True)(validate_email)
#     _validate_password = validator('password', allow_reuse=True)(validate_password_strength)
