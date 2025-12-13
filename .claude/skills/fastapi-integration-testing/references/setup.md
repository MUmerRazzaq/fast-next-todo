# Integration Test Setup Guide

This guide explains how to set up your environment for integration testing a FastAPI application using the provided templates.

## 1. Test Database Configuration

For reliable and isolated tests, a separate test database is crucial. The templates use a file-based SQLite database (`./test.db`), but you can configure it for in-memory or any other database.

**Key File**: `assets/conftest_template.py`

This file contains `pytest` fixtures to manage the database:

-   `setup_test_db()`: Creates the database schema before tests start and tears it down after they finish. This fixture has `autouse=True` so it runs automatically.
-   `db_session()`: Provides a clean database session for each test function. It wraps the test in a transaction and rolls it back afterward, ensuring test isolation.

**To Use**:
1.  Copy `assets/conftest_template.py` to your test directory (e.g., `/tests/conftest.py`).
2.  Uncomment and import your FastAPI `app`, your database `Base` model, and your `get_db` dependency.
3.  Ensure your application's dependency overrides are set up to use the test database during tests.

```python
# In conftest.py, after defining override_get_db
# app.dependency_overrides[get_db] = override_get_db
```

## 2. Test Client

FastAPI's `TestClient` allows you to make requests to your application without running a live server.

**Key File**: `assets/conftest_template.py`

The `client()` fixture provides an instance of `TestClient`.

**To Use**:
1.  In your `conftest.py`, make sure you import your `app` object from your FastAPI application.
2.  Uncomment the `with TestClient(app) as c:` block within the `client` fixture.

Your test functions can then receive the `client` and `db_session` fixtures as arguments:

```python
def test_my_endpoint(client: TestClient, db_session: Session):
    # ... your test code
```
