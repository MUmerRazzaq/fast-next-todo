# Transaction Handling in SQLAlchemy

A transaction is a sequence of operations performed as a single logical unit of work. All of the operations must succeed; if any of them fail, the entire transaction is rolled back, and the database is left unchanged. SQLAlchemy provides powerful and easy-to-use patterns for managing transactions.

## 1. The `session.begin()` Context Manager

The preferred way to handle transactions is with the `session.begin()` context manager. This pattern is concise and safe, as it automatically handles commit and rollback.

- If the block of code within the `with` statement completes without any errors, the transaction is automatically **committed**.
- If an exception is raised within the block, the transaction is automatically **rolled back**.

```python
from sqlalchemy.orm import Session

def transfer_funds(db: Session, from_user_id: int, to_user_id: int, amount: float):
    """
    Transfers funds from one user to another in a single transaction.
    """
    try:
        with db.begin():
            # The 'begin()' call starts a transaction.
            from_user = db.query(User).filter(User.id == from_user_id).one()
            to_user = db.query(User).filter(User.id == to_user_id).one()

            if from_user.balance < amount:
                raise ValueError("Insufficient funds.")

            from_user.balance -= amount
            to_user.balance += amount

        # If the block above completes, the changes are committed here.
        # If any exception (like Insufficient funds) occurs, everything is rolled back.

    except Exception as e:
        print(f"Transaction failed: {e}")
        # The rollback is handled automatically by the context manager exiting with an exception.
```

## 2. Reusable Transaction Context Manager for Web Apps

For more complex applications, especially web apps using dependency injection, it can be useful to have a reusable context manager that encapsulates the transaction logic. This keeps your application logic clean and separates concerns.

Here is an example of a `TransactionManager` class that can be used with a framework like FastAPI.

```python
# In a file like `transactions.py` or `dependencies.py`
from contextlib import contextmanager
from sqlalchemy.orm import Session
from .database import SessionLocal # Your sessionmaker from database.py

@contextmanager
def transaction_manager():
    """
    A context manager to provide a transactional scope around a series of operations.
    """
    db: Session = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# How to use it in an application (e.g., FastAPI):

# @router.post("/transfers")
# def perform_transfer(transfer_data: TransferSchema):
#     with transaction_manager() as db:
#         # The 'db' here is a session with a transaction started.
#         # All operations using this 'db' object are part of the same transaction.
#         service_one.do_something(db, data=transfer_data.one)
#         service_two.do_something_else(db, data=transfer_data.two)
#     # The transaction is committed here if no exceptions were raised.
#     # Otherwise, it's rolled back.
#     return {"status": "success"}

```

### Why a Reusable Manager is Useful:

- **Clean API Logic**: Your API route handlers don't need to be cluttered with `try/except/finally` blocks for transaction management.
- **Single Unit of Work**: It guarantees that multiple service calls within the `with` block are part of the same atomic transaction.
- **Centralized Logic**: The logic for beginning, committing, or rolling back a transaction is in one place, making it easy to maintain and debug.
