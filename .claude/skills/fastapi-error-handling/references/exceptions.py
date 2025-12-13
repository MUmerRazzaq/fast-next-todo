from fastapi import status

class APIException(Exception):
    """Base class for API exceptions"""
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    message: str = "An internal server error occurred."
    user_message: str = "Something went wrong on our end. Please try again later."

    def __init__(self, message: str = None, user_message: str = None, status_code: int = None):
        if message:
            self.message = message
        if user_message:
            self.user_message = user_message
        if status_code:
            self.status_code = status_code
        super().__init__(self.message)

class NotFound(APIException):
    """Not Found Error"""
    status_code = status.HTTP_404_NOT_FOUND
    message = "Resource not found."
    user_message = "The requested resource could not be found."

class Unauthorized(APIException):
    """Unauthorized Error"""
    status_code = status.HTTP_401_UNAUTHORIZED
    message = "Authentication credentials were not provided or were invalid."
    user_message = "You are not authorized to perform this action."

class ValidationError(APIException):
    """Validation Error"""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    message = "Validation error."
    user_message = "Invalid data provided."

    def __init__(self, message: str = None, user_message: str = None, detail: dict = None):
        super().__init__(message, user_message)
        self.detail = detail
