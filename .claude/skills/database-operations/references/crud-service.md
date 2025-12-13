# Generic CRUD Service (Repository Pattern)

A common and highly effective pattern for structuring a data access layer is to use a generic base class for CRUD (Create, Read, Update, Delete) operations. This is often called a "Repository" pattern. It allows you to write the common database logic once and reuse it for all your models.

## 1. The Generic `CRUDBase` Class

This class uses Python's `typing.Generic` and `TypeVar` to create a reusable service that can work with any SQLAlchemy model and corresponding Pydantic schemas.

```python
# crud.py or repository.py
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Define custom types for SQLAlchemy model, and Pydantic schemas
ModelType = TypeVar("ModelType", bound=Any)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).

        **Parameters**

        * `model`: A SQLAlchemy model class
        """
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)  # type: ignore
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> ModelType:
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj

```

## 2. Creating a Concrete Service

To use the `CRUDBase`, you create a new class for each of your SQLAlchemy models that inherits from it. You can also add model-specific query methods to this new class.

```python
# In a file for your specific model, e.g., `crud_user.py`

from .crud import CRUDBase
from .models import User
from .schemas import UserCreate, UserUpdate
from sqlalchemy.orm import Session

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(self.model).filter(User.email == email).first()

# Create a single instance of the service for use in your application
user_service = CRUDUser(User)
```

## 3. Using the Service in Your Application

Now, in your application logic (e.g., FastAPI routes), you can import the service instance and use its methods.

```python
# In your API routes file
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import schemas
from . import crud_user
from .dependencies import get_db

router = APIRouter()

@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
):
    """
    Create new user.
    """
    user = crud_user.user_service.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud_user.user_service.create(db=db, obj_in=user_in)
    return user
```

This pattern keeps your API layer clean and separates concerns effectively. The routes handle HTTP logic, and the CRUD service handles database interaction.
