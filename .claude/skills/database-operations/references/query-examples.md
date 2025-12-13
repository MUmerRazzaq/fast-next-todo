# Advanced Querying and Bulk Operations

This document provides examples of more advanced querying techniques in SQLAlchemy, including complex filters, joins, aggregations, and efficient bulk operations.

## 1. Complex Filtering

SQLAlchemy provides `and_`, `or_`, and `not_` to build complex filter conditions.

```python
from sqlalchemy import and_, or_, not_

# Find users named 'sandy' OR 'squidward'
query = db.query(User).filter(or_(User.name == 'sandy', User.name == 'squidward'))

# Find users named 'sandy' who also have a password starting with 'spongebob'
query = db.query(User).filter(
    and_(
        User.name == 'sandy',
        User.password.like('spongebob%')
    )
)

# Chaining .filter() or .filter_by() is equivalent to using and_()
query = db.query(User).filter(User.name == 'sandy').filter(User.password.like('spongebob%'))

# Find all users whose name is not 'squidward'
query = db.query(User).filter(not_(User.name == 'squidward'))
```

## 2. Joins

You can join between models to query across tables.

```python
# Assuming a User model has a relationship to an Address model

# Inner Join (get users who have an address in a specific city)
# SQLAlchemy can often infer the ON clause from the relationship
query = db.query(User).join(Address).filter(Address.city == 'Bikini Bottom')

# Explicitly defining the ON clause
query = db.query(User).join(Address, User.id == Address.user_id)

# Left Outer Join (get all users, and their address if it exists)
# Use isouter=True for a LEFT JOIN
query = db.query(User).join(Address, isouter=True)

# Selecting from multiple tables
# Returns tuples of (User, Address)
query = db.query(User, Address).join(Address, User.id == Address.user_id)
```

## 3. Aggregations

Use the `func` object to perform SQL aggregate functions like `COUNT`, `SUM`, `AVG`, etc., often combined with `group_by()` and `having()`.

```python
from sqlalchemy import func

# Count the number of users
user_count = db.query(func.count(User.id)).scalar()

# Count the number of users per city
# Returns a list of tuples: [(count, city), ...]
user_counts_by_city = db.query(func.count(User.id), User.city).group_by(User.city).all()

# Find cities with more than 10 users
cities_with_many_users = db.query(User.city, func.count(User.id).label('user_count')) \
    .group_by(User.city) \
    .having(func.count(User.id) > 10) \
    .all()
```

## 4. Bulk Operations

For performance-critical applications, inserting or updating many rows at once is much more efficient than doing so one by one.

### Bulk Insert

Use `session.bulk_insert_mappings()` to insert a large number of records from a list of dictionaries. This is much faster than a for-loop with `session.add()`.

```python
users_to_create = [
    {"name": "patrick", "fullname": "Patrick Star"},
    {"name": "mr_krabs", "fullname": "Eugene H. Krabs"},
]

with db.begin():
    db.bulk_insert_mappings(User, users_to_create)
```

### Bulk Update

Similarly, use `session.bulk_update_mappings()` to update many records at once. The dictionaries must contain the primary key of the records to be updated.

```python
users_to_update = [
    {"id": 4, "name": "pat-pat"},
    {"id": 5, "name": "money-money"},
]

with db.begin():
    db.bulk_update_mappings(User, users_to_update)
```

### Filtered Bulk Update

To update a large number of rows based on a filter condition without loading them into memory, use `query.update()`. This is extremely efficient.

```python
# Give all inactive users a default status message
with db.begin():
    db.query(User).filter(User.is_active == False).update(
        {"status": "archived"},
        synchronize_session=False
    )
```
**Note on `synchronize_session`**:
- `False`: The fastest option. The session is not updated, so objects already loaded in the session might have stale data.
- `'fetch'`: Fetches the primary keys of the updated rows and expires the corresponding objects in the session, causing them to be reloaded on next access.
- `'evaluate'`: Tries to evaluate the update condition on objects in the session. This can be slow and complex.

For most bulk update cases, `False` is appropriate if you don't need to immediately work with the updated objects in the same session.
