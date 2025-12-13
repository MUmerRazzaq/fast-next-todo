# Organization-Level Multi-Tenancy

Multi-tenancy is the practice of serving multiple independent "tenants" from a single application instance. A common approach is to scope all data by an `organization_id` (or `tenant_id`). All the previous examples have already been using this pattern. This guide formalizes the key principles.

## 1. Data Model

Every relevant table in your database should have a foreign key to the `organizations` table.

```python
# app/models/item.py
class Item(Base):
    # ... other columns
    organization_id = Column(Integer, ForeignKey("organization.id"), nullable=False, index=True)

# app/models/user.py
class User(Base):
    # ... other columns
    organization_id = Column(Integer, ForeignKey("organization.id"), nullable=False, index=True)
```

By making `organization_id` non-nullable, you enforce that every piece of data is associated with an organization.

## 2. User Context

The `UserContext` must include the `organization_id` of the current user. This is extracted from the JWT.

```python
# app/schemas/user.py
class UserContext(BaseModel):
    user_id: int
    organization_id: int
    is_admin: bool = False
```

## 3. Scoped Queries (The Core of Multi-Tenancy)

Every single database query must be filtered by the `organization_id` from the `UserContext`. This is the most critical part of a multi-tenant architecture.

A base repository/service is the best place to enforce this.

```python
# app/repository/base.py
class CRUDBase:
    # ...

    def get_query(self, db: Session, user_context: UserContext):
        """
        Returns a query object filtered by the user's organization.
        This is the core of the multi-tenancy implementation.
        """
        if user_context.is_admin:
            # Admins can query across organizations
            return db.query(self.model)

        return db.query(self.model).filter(self.model.organization_id == user_context.organization_id)
```

All other repository methods should build upon this `get_query` method. This ensures that no data can ever leak between organizations, as the base query is *always* scoped to the current user's organization.

```python
# app/repository/item.py
class CRUDItem(CRUDBase):
    def get_all(self, db: Session, user_context: UserContext) -> List[Item]:
        """
        Get all items for the current organization.
        """
        # The call to self.get_query(...) ensures multi-tenancy.
        return self.get_query(db, user_context).all()
```

## 4. Creating New Resources

When a user creates a new resource, it must be automatically assigned to their organization. **Do not** trust the user to provide the correct `organization_id` in the request body.

```python
# app/repository/item.py
class CRUDItem(CRUDBase):
    def create(self, db: Session, user_context: UserContext, obj_in: ItemCreate) -> Item:
        db_obj = self.model(
            **obj_in.dict(),
            owner_id=user_context.user_id,
            organization_id=user_context.organization_id # Set organization from context
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
```

By following these principles, you can build a secure multi-tenant application where data is strictly isolated between different organizations.
