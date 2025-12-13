# Model Definition, Fields, and Constraints

This document provides patterns for defining basic SQLModel models, including fields with various types and constraints.

## Basic Model Definition

A SQLModel model is a class that inherits from `SQLModel`. The `table=True` argument in the class definition indicates that it corresponds to a database table.

```python
from typing import Optional
from sqlmodel import Field, SQLModel

class MyModel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
```

## Field Types and Constraints

SQLModel uses standard Python types. You can use `typing.Optional` to make a field nullable. The `Field` function is used to define constraints.

- `primary_key=True`: Marks a field as the primary key.
- `default=...`: Sets a default value.
- `nullable=True/False`: Controls if the field can be NULL in the database.
- `unique=True`: Enforces that all values in this column are unique.
- `index=True`: Creates a database index on this column.
- `sa_column_kwargs={...}`: Pass backend-specific arguments.

### Example: User Model

```python
from typing import Optional
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)
```

### Example: Task Model

```python
import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    due_date: Optional[datetime.date] = Field(default=None)
    is_completed: bool = Field(default=False)

    owner_id: int = Field(foreign_key="user.id")
```

### Example: Category Model

```python
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None
```
