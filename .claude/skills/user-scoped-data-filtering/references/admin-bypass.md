# Admin Bypass Patterns

In many applications, administrators or support staff need the ability to view or manage data across all users and organizations. This requires a "bypass" mechanism for the data scoping rules. It's crucial to implement this carefully to avoid accidental privilege escalation.

## 1. The `is_admin` Flag

The simplest way to handle this is with a boolean flag in the `UserContext`.

```python
# app/schemas/user.py
class UserContext(BaseModel):
    user_id: int
    organization_id: int
    is_admin: bool = False # The flag
```

This `is_admin` flag should be encoded into the user's JWT by your authentication service upon successful login if they have an admin role. **Never** trust a value passed from the client.

## 2. Conditional Scoping in the Service Layer

The service/repository layer is the ideal place to implement the bypass logic. The base repository's `get_query` method can check for the `is_admin` flag.

```python
# app/repository/base.py
class CRUDBase:
    # ...

    def get_query(self, db: Session, user_context: UserContext):
        """
        Returns a query object. If the user is an admin, the query is unscoped.
        Otherwise, it's filtered by the user's organization.
        """
        if user_context.is_admin:
            # For admins, return the unscoped query
            return db.query(self.model)

        # For regular users, return the scoped query
        return db.query(self.model).filter(self.model.organization_id == user_context.organization_id)
```

Because all other repository methods use `get_query`, this logic is centralized and applied consistently. An admin calling `item_repo.get_all()` will see all items, while a regular user will only see items from their organization.

## 3. Bypassing Ownership Checks

The ownership verification decorator should also respect the `is_admin` flag.

```python
# app/security/decorators.py
def verify_ownership(func):
    @wraps(func)
    def wrapper(self, db, user_context: UserContext, resource_id: int, *args, **kwargs):
        # Admins can bypass ownership checks
        if user_context.is_admin:
            return func(self, db, user_context, resource_id, *args, **kwargs)

        # ... rest of the decorator ...
```

This allows an admin to update or delete resources they don't own, which is often necessary for support and maintenance tasks.

## Security Considerations

*   **Audit EVERYTHING**: When an admin bypasses scoping rules, it is critical to log this action. See `audit-trail.md` for more details.
*   **Principle of Least Privilege**: Grant admin access sparingly. Consider creating different levels of admin roles (e.g., a "support" role that can view data but not modify it).
*   **API Design**: You might consider creating separate API endpoints for admin actions (e.g., `/api/v1/admin/items`) which have stricter access controls. However, implementing the bypass in the service layer as shown here is often more DRY (Don't Repeat Yourself).
