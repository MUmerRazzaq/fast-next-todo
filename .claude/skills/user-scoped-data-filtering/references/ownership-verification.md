# Ownership Verification

For write operations like updates and deletes, you must ensure the user owns the resource they're trying to modify. A clean way to implement this is with a decorator that wraps your service/repository methods.

## 1. The Ownership Verification Decorator

This decorator will take a function that retrieves a resource by its ID. It then checks if the resource's `owner_id` matches the `user_id` in the `UserContext`.

```python
# app/security/decorators.py
from functools import wraps
from fastapi import HTTPException, status

from app.schemas.user import UserContext

def verify_ownership(func):
    """
    Decorator to verify that the user owns the resource they are trying to access.
    Assumes the wrapped function is a method of a class with a 'get' method
    that retrieves the resource by ID.
    Assumes the resource has an 'owner_id' attribute.
    """
    @wraps(func)
    def wrapper(self, db, user_context: UserContext, resource_id: int, *args, **kwargs):
        # Admins can bypass ownership checks
        if user_context.is_admin:
            return func(self, db, user_context, resource_id, *args, **kwargs)

        resource = self.get(db=db, user_context=user_context, id=resource_id) # Assumes a get method

        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

        if resource.owner_id != user_context.user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

        return func(self, db, user_context, resource_id, *args, **kwargs)

    return wrapper
```

**Note:** This decorator makes some assumptions:
*   It's used on a method of a class (a repository/service).
*   The class has a `get` method to fetch the resource.
*   The resource object has an `owner_id` attribute.
*   The decorated function receives `db`, `user_context`, and a resource ID as arguments. You may need to adjust this to your function signatures.

## 2. Applying the Decorator

You can now apply this decorator to your service methods for updating or deleting resources.

```python
# app/repository/item.py
from .base import CRUDBase
from ..models.item import Item
from ..schemas.item import ItemUpdate
from ..schemas.user import UserContext
from ..security.decorators import verify_ownership
from sqlalchemy.orm import Session

class CRUDItem(CRUDBase):
    # ... other methods from previous example ...

    @verify_ownership
    def update(self, db: Session, user_context: UserContext, resource_id: int, obj_in: ItemUpdate) -> Item:
        # By the time this code runs, ownership is already verified.
        db_obj = self.get(db, user_context, resource_id)
        # ... update logic ...
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @verify_ownership
    def remove(self, db: Session, user_context: UserContext, resource_id: int) -> Item:
        # Ownership is verified.
        db_obj = self.get(db, user_context, resource_id)
        db.delete(db_obj)
        db.commit()
        return db_obj


item = CRUDItem(Item)
```

This pattern keeps your ownership verification logic separate from your business logic, making your code cleaner and more maintainable.
