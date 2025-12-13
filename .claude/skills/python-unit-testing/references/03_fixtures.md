# Pytest Fixture Patterns

Fixtures are a powerful feature in `pytest` for providing a fixed baseline upon which tests can reliably and repeatedly execute. They are used to set up objects, data, or system state for tests.

## What is a Fixture?

A fixture is a function decorated with `@pytest.fixture`. This function runs before each test function that requests it. The return value of the fixture function is passed as an argument to the test function.

## When to Use Fixtures

Use fixtures to:
1.  **Provide Data**: Supply test functions with data, like a sample user object or a complex data structure.
2.  **Set Up State**: Prepare a system state, like creating a temporary file or setting up a database connection.
3.  **Manage Dependencies**: Provide mock objects or test doubles for external services (databases, APIs).

## Basic Fixture

A simple fixture provides a reusable piece of data.

```python
# in conftest.py
import pytest

@pytest.fixture
def sample_user():
    """A fixture that provides a sample user dictionary."""
    return {"username": "test", "email": "test@example.com"}

# in tests/test_user.py
def test_user_email(sample_user):
    """Test that the user's email domain is correct."""
    assert sample_user["email"].endswith("@example.com")
```

## `conftest.py`

-   Fixtures that are used by multiple test files should be placed in a `conftest.py` file.
-   `pytest` automatically discovers fixtures in `conftest.py` files in the test directory and its parent directories.
-   A common pattern is to have a top-level `conftest.py` in your `tests/` directory for globally used fixtures.

**See `assets/conftest.py` for examples of mock fixtures.**

## Fixture Scopes

Fixtures are created and torn down for each test function by default (`scope="function"`). You can change this behavior with the `scope` argument to improve performance for expensive setup operations.

-   `scope="function"`: (Default) Run once per test function.
-   `scope="class"`: Run once per test class.
-   `scope="module"`: Run once per module.
-   `scope="session"`: Run once per test session.

```python
import pytest

@pytest.fixture(scope="module")
def db_connection():
    """This fixture creates a DB connection once per module."""
    conn = create_expensive_db_connection()
    yield conn  # The test runs here
    conn.close() # Teardown code runs after all tests in the module are done
```
The `yield` statement separates setup code from teardown code.

## Built-in Fixtures

`pytest` provides several useful built-in fixtures:
-   `tmp_path`: Provides a temporary directory unique to the test invocation.
-   `capsys`: Captures `stdout` and `stderr`.
-   `monkeypatch`: Safely patch attributes, dictionaries, or environment variables.
-   `mocker`: A wrapper around `unittest.mock` provided by the `pytest-mock` plugin.
