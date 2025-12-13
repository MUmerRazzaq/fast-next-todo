# Scoped Database Queries

Once you have the `UserContext`, you must apply it to your database queries to ensure users can only access their own data. A good way to structure this is by using a service or repository pattern where every method takes the `UserContext` as an argument.

This ensures that data access is always performed within the context of a specific user.

## 1. Example SQLAlchemy Model

Let's assume we have a simple `Item` model that belongs to a user and an organization.

```python
# app/models/item.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Item(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("user.id"))
    organization_id = Column(Integer, ForeignKey("organization.id"))

    owner = relationship("User", back_populates="items")
    organization = relationship("Organization", back_populates="items")
```

## 2. Base Repository/Service

You can create a base class for your repositories that provides helper methods for applying filters.

```python
# app/repository/base.py
from typing import Generic, Type, TypeVar
from sqlalchemy.orm import Session
from app.db.base_class import Base
from app.schemas.user import UserContext

ModelType = TypeVar("ModelType", bound=Base)

class CRUDBase:
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get_query(self, db: Session, user_context: UserContext):
        """
        Returns a query object filtered by the user's organization.
        Admins get to see all data.
        """
        if user_context.is_admin:
            return db.query(self.model)
        return db.query(self.model).filter(self.model.organization_id == user_context.organization_id)

```

## 3. Item Repository/Service

Your specific repository for the `Item` model can then inherit from this base and add its own methods.

```python
# app/repository/item.py
from sqlalchemy.orm import Session
from typing import List

from .base import CRUDBase
from ..models.item import Item
from ..schemas.user import UserContext

class CRUDItem(CRUDBase):
    def get(self, db: Session, user_context: UserContext, item_id: int) -> Item | None:
        """
        Get a single item, scoped by organization.
        """
        return self.get_query(db, user_context).filter(Item.id == item_id).first()

    def get_all_for_user(self, db: Session, user_context: UserContext) -> List[Item]:
        """
        Get all items for the current user within their organization.
        """
        return self.get_query(db, user_context).filter(Item.owner_id == user_context.user_id).all()

item = CRUDItem(Item)
```

## 4. Usage in API Endpoint

Finally, in your API endpoint, you can use the repository methods, passing in the database session and the user context.

```python
# app/api/v1/endpoints/items.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_user_context, get_db
from app.schemas.user import UserContext
from app.schemas.item import Item as ItemSchema # Pydantic schema
from app.repository import item as crud_item

router = APIRouter()

@router.get("/items", response_model=List[ItemSchema])
def read_items(
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_user_context)
):
    items = crud_item.get_all_for_user(db=db, user_context=current_user)
    return items
```

This pattern ensures that every database query is correctly scoped, preventing data leakage between users and organizations.
