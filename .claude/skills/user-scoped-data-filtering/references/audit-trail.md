# Audit Trail for Data Access

Creating an audit trail is crucial for security, compliance, and debugging. It provides a record of who accessed or modified what data, and when. This is especially important for actions performed by administrators who are bypassing standard data scoping rules.

## 1. Audit Log Model

First, you need a model to store your audit logs. This can be a separate table in your database.

```python
# app/models/audit_log.py
import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.db.base_class import Base

class AuditLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, index=True)
    action = Column(String, index=True) # e.g., 'view_item', 'update_item'
    resource_id = Column(Integer, index=True, nullable=True)
    details = Column(JSON, nullable=True) # For storing extra info, like changes
```

## 2. Audit Logging Service

Create a simple service to write to the audit log.

```python
# app/services/audit.py
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.schemas.user import UserContext

def log_action(
    db: Session,
    user_context: UserContext,
    action: str,
    resource_id: int | None = None,
    details: dict | None = None
):
    log_entry = AuditLog(
        user_id=user_context.user_id,
        action=action,
        resource_id=resource_id,
        details=details or {}
    )
    db.add(log_entry)
    db.commit()

```

## 3. Integrating Audit Logging

You can now call this `log_action` function from your service/repository methods.

### Logging Read Access

```python
# app/repository/item.py
class CRUDItem(CRUDBase):
    def get(self, db: Session, user_context: UserContext, item_id: int) -> Item | None:
        # ...
        item = self.get_query(db, user_context).filter(Item.id == item_id).first()
        if item and user_context.is_admin:
            log_action(db, user_context, "admin_view_item", resource_id=item_id)
        return item
```

### Logging Write Access

A good place to log updates is within the ownership verification decorator, or directly in the update/delete methods.

```python
# app/repository/item.py
class CRUDItem(CRUDBase):
    # ...
    @verify_ownership
    def update(self, db: Session, user_context: UserContext, resource_id: int, obj_in: ItemUpdate) -> Item:
        db_obj = self.get(db, user_context, resource_id)
        # ... update logic ...
        db.commit()

        log_action(
            db,
            user_context,
            "update_item",
            resource_id=resource_id,
            details={"changes": obj_in.dict(exclude_unset=True)}
        )

        db.refresh(db_obj)
        return db_obj
```

## 4. Using a Middleware or Dependency for Logging

For a more comprehensive solution, you can create a middleware or a background task to handle logging for all API endpoints. This can automatically log every request.

```python
# app/main.py (simplified example)
from fastapi import FastAPI, Request, Depends
from app.services.audit import log_action
from app.dependencies import get_db, get_user_context

app = FastAPI()

@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    response = await call_next(request)

    # This is a simplified example. In a real app, you would
    # need to resolve dependencies manually or use a more advanced pattern.
    # For example, you might put the logging logic in a background task.
    # path = request.url.path
    # if path.startswith("/api/"):
    #     try:
    #         # This is pseudo-code for getting dependencies inside middleware
    #         db = get_db_from_request_state(request)
    #         user_context = get_user_context_from_request_state(request)
    #         log_action(db, user_context, f"access_{request.method}_{path}")
    #     except Exception:
    #         # Handle cases where user is not authenticated, etc.
    #         pass

    return response

```

Middleware-based logging provides broad coverage but can be less specific than logging within your service layer. A combination of both is often the best approach: use middleware for general access logs and service-level logging for detailed actions like admin bypasses or data modifications.
