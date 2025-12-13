# Validation Error Response Formatting

By default, FastAPI returns a JSON response with a detailed error message when validation fails. You can customize this response format.

## Custom Exception Handler

Create a custom exception handler for `fastapi.exceptions.RequestValidationError` to control the error response format.

1.  **Define the handler function**: This function takes the `request` and the `exc` (exception) as arguments.
2.  **Process the errors**: The exception object `exc.errors()` contains a list of dictionaries, each describing a validation error. You can reformat this list.
3.  **Return a `JSONResponse`**: Return a `fastapi.responses.JSONResponse` with your custom content and status code.

### Example Handler

This handler creates a simpler error structure.

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(error["loc"]),
            "message": error["msg"]
        })
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )
```

### Registering the Handler

Add the handler to your FastAPI application using the `@app.exception_handler` decorator or by updating `app.exception_handlers`.

```python
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError

app = FastAPI()

# Add the handler to the app
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Or using a decorator on the handler function
# @app.exception_handler(RequestValidationError)
# async def validation_exception_handler...
```

A complete, runnable example of this handler is available in `scripts/error_handler.py`.
