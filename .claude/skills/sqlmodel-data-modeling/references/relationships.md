# Model Relationships

This document explains how to define relationships between SQLModel models.

## One-to-Many (1:N) Relationship

A one-to-many relationship links one record in a table to multiple records in another. For example, one `User` can have many `Task`s.

- Use `Relationship` to define the link.
- Use `back_populates` to create a bi-directional relationship.
- The "many" side has a `foreign_key`.

```python
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)

    tasks: List["Task"] = Relationship(back_populates="owner")

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str

    owner_id: int = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="tasks")
```

## Many-to-Many (N:M) Relationship

A many-to-many relationship requires a junction table (also called a link table) to connect two models. For example, a `Task` can have multiple `Category`s, and a `Category` can have multiple `Task`s.

1.  **Define the Junction Table**: This model holds foreign keys to the two models it links.
2.  **Define Relationships**: In the main models, define `List[...]` relationships with `link_model` pointing to the junction table.

```python
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship

class TaskCategoryLink(SQLModel, table=True):
    task_id: Optional[int] = Field(
        default=None, foreign_key="task.id", primary_key=True
    )
    category_id: Optional[int] = Field(
        default=None, foreign_key="category.id", primary_key=True
    )

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str

    categories: List["Category"] = Relationship(back_populates="tasks", link_model=TaskCategoryLink)

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)

    tasks: List[Task] = Relationship(back_populates="categories", link_model=TaskCategoryLink)
```
