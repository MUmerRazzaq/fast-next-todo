# Advanced Data Modeling Patterns

This guide covers advanced SQLModel features like inheritance, computed properties, JSON fields, and audit timestamps.

## Base Model with Audit Fields

Create a base model class with common fields like `id`, `created_at`, and `updated_at` to reuse across your models.

```python
import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import func

class BaseModel(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )

class MyModel(BaseModel, table=True):
    name: str
```
Note: `onupdate` works on the SQL level. If you update the model instance and commit, it updates.

## Model Inheritance

SQLModel supports table inheritance through a shared primary key. This is not standard SQL and might not be supported on all databases.

A more common pattern is to share fields via a base class that is not a table itself (like `BaseModel` above).

## JSON Field Handling

For storing JSON data, use `sqlalchemy.types.JSON`.

```python
from typing import Dict, Any, Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import Column
from sqlalchemy.types import JSON

class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")

    # Store settings as a JSON blob
    settings: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
```

## Computed Properties

You can define properties on your model that are computed from other fields. These are not stored in the database.

```python
from typing import Optional
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
```
