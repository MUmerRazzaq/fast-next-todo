# Model Validation

SQLModel integrates with Pydantic, allowing you to use its validation features.

## Field Validation

Use the `@validator` decorator from Pydantic to add custom validation logic for a field.

```python
from sqlmodel import SQLModel, Field, validator
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str = Field(unique=True)

    @validator("email")
    def email_must_be_valid(cls, v):
        if "@" not in v:
            raise ValueError("Invalid email address")
        return v

    @validator("username")
    def username_must_be_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric")
        return v.lower()
```

## Model-level Validation

For validation that involves multiple fields, use a `@root_validator`.

```python
from sqlmodel import SQLModel, Field, root_validator
from typing import Optional
import datetime

class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    start_time: datetime.datetime
    end_time: datetime.datetime

    @root_validator
    def check_times(cls, values):
        start, end = values.get("start_time"), values.get("end_time")
        if start and end and start >= end:
            raise ValueError("end_time must be after start_time")
        return values
```
SQLModel validation runs when you create or update an instance of the model.
