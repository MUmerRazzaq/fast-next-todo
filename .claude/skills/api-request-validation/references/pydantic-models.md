# Pydantic Model Validation

Pydantic models are the standard way to define data structures for request bodies. FastAPI automatically uses these models to parse and validate incoming JSON.

## Basic Model

Define a class that inherits from `pydantic.BaseModel`. Add attributes with type hints for each field you expect in the request body.

```python
from pydantic import BaseModel

class User(BaseModel):
    username: str
    email: str
    full_name: str | None = None
```

In this example:
- `username` and `email` are required strings.
- `full_name` is an optional string.

## Field-Level Validation

You can add validation rules directly to fields using `pydantic.Field`.

```python
from pydantic import BaseModel, Field

class Item(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    price: float = Field(..., gt=0, description="The price must be greater than zero")
    tax: float | None = None
```

- `...` as the first argument makes a field required.
- `gt=0` means the value must be greater than 0.
- `min_length` and `max_length` constrain string length.

Pydantic provides many other validation parameters for `Field`, such as `lt`, `le`, `ge`, `multiple_of`, `regex`, etc.
