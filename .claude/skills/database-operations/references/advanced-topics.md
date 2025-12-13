# Advanced Topics: Error Handling, Pooling, and Optimization

This document covers advanced topics that are crucial for building robust and performant database applications.

## 1. Error Handling

Properly handling database errors is key to application stability. Most SQLAlchemy-specific exceptions are in `sqlalchemy.exc`.

### `IntegrityError`

This is the most common exception, typically raised when a database constraint (like a `UNIQUE` constraint) is violated upon `session.commit()`. The transaction is automatically invalidated and **must be rolled back**.

```python
from sqlalchemy.exc import IntegrityError

try:
    with db.begin():
        # ... code that might violate a constraint
        db.add(new_user_with_duplicate_email)
except IntegrityError:
    # The 'with db.begin()' block handles the rollback automatically
    # You just need to catch the error and handle it (e.g., return an HTTP 409 error)
    print("User with this email already exists.")
```

### `NoResultFound` and `MultipleResultsFound`

These are raised when you use `.one()` and the query returns zero or more than one result, respectively. If you want to handle these cases without exceptions, use `.first()` (returns `None` if not found) or `.all()`.

```python
from sqlalchemy.orm.exc import NoResultFound

try:
    user = db.query(User).filter(User.id == 999).one()
except NoResultFound:
    print("User not found.")
```

### Disconnection Errors (`OperationalError`)

Transient network issues can cause disconnection errors. SQLAlchemy's connection pool has built-in resilience, especially when configured with `pool_pre_ping=True`. This setting checks if a connection is alive before using it, gracefully handling many common disconnection scenarios.

## 2. Connection Pooling

SQLAlchemy's `Engine` manages a pool of database connections. The default, `QueuePool`, is suitable for most web applications. You can tune its behavior through arguments to `create_engine`.

```python
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    # The number of connections to keep open in the pool.
    pool_size=10,
    # The number of additional connections that can be opened on demand.
    max_overflow=20,
    # How long to wait for a connection before timing out (in seconds).
    pool_timeout=30,
    # Recycles connections after this many seconds. Crucial for databases
    # that time out idle connections (like MySQL).
    pool_recycle=1800, # 30 minutes
    # Checks if a connection is alive before using it. Prevents many
    # disconnection errors at the cost of a tiny overhead.
    pool_pre_ping=True
)
```

## 3. Query Optimization

Writing efficient queries is the most important factor in database performance.

### Eager Loading (Avoiding the N+1 Problem)

The "N+1" problem is the single most common performance bottleneck in ORMs. It happens when you fetch a list of objects (1 query) and then access a related attribute on each object, triggering a new query for each one (N queries).

**The solution is Eager Loading.** You tell SQLAlchemy to fetch the related objects in advance using a more efficient query.

- **`selectinload`**: This is the recommended strategy for to-many relationships. It issues a second `SELECT` statement to fetch all the related objects at once.
- **`joinedload`**: This uses a `LEFT OUTER JOIN` to fetch related objects in the same query. It's good for to-one relationships but can be inefficient for to-many.

```python
from sqlalchemy.orm import selectinload

# BAD: N+1 problem. Accessing user.addresses triggers a new query for each user.
users = db.query(User).all()
for user in users:
    print(user.addresses) # N more queries!

# GOOD: Eager loading with selectinload.
# Fetches all users in one query, and all their addresses in a second query. Total: 2 queries.
users = db.query(User).options(selectinload(User.addresses)).all()
for user in users:
    print(user.addresses) # No new queries!
```

### Other Key Techniques

- **Select Only What You Need**: If you only need a few columns, query for them specifically.
  ```python
  # Good: Fetches only id and name
  users = db.query(User.id, User.name).all()
  ```
- **Use Server-Side Aggregates**: Perform calculations in the database with `func`.
  ```python
  # Good: Database does the counting
  count = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
  ```
- **Stream Large Results**: To process a huge number of rows without consuming all your memory, use `yield_per()`.
  ```python
  for user in db.query(User).yield_per(100):
      # Processes users in batches of 100
      process_user(user)
  ```
