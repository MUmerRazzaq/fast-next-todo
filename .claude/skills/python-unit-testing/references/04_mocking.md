# Mocking External Dependencies

Unit tests should be fast, reliable, and isolated. When your code interacts with external systems like databases, APIs, or the filesystem, you should "mock" these dependencies. Mocking means replacing the real dependency with a test double that you control.

## Why Mock?

-   **Isolation**: Your test fails only if your code is wrong, not because the network is down or an API key expired.
-   **Speed**: Network and database calls are slow. Mocks are in-memory and instant.
-   **Control**: You can force dependencies to behave in specific ways (e.g., simulate an API error, return specific data) to test all paths in your code.

## Using `pytest-mock`

The `pytest-mock` plugin provides the `mocker` fixture, a convenient way to use `unittest.mock`.

### `mocker.patch()`

This is the most common mocking tool. It replaces an object with a mock for the duration of a test.

**Key Idea**: You patch the object *where it is looked up*, not where it is defined.

If `my_app/service.py` has `from my_app.db import get_connection`, you patch `my_app.service.get_connection`.

```python
# in my_app/service.py
from my_app.db import get_connection

def get_user_from_db(user_id):
    conn = get_connection()
    # ... uses conn ...

# in tests/test_service.py
def test_get_user_from_db(mocker):
    # Arrange
    mock_conn = mocker.patch("my_app.service.get_connection")
    mock_cursor = mock_conn.return_value.cursor.return_value
    mock_cursor.fetchone.return_value = ("Test User",)

    # Act
    get_user_from_db(1)

    # Assert
    mock_conn.assert_called_once()
    mock_cursor.execute.assert_called_with("SELECT name FROM users WHERE id=%s", (1,))
```

### Mocking with Fixtures

For common dependencies, create mock fixtures in `conftest.py`. This makes tests cleaner and promotes reuse.

**See `assets/conftest.py` for examples of `mock_db_connection` and `mock_api_client` fixtures.**

**See `assets/templates/mocking_test.py` for how to use these fixtures in a test.**

## Asserting Mock Calls

A key part of testing with mocks is verifying that your code interacted with the dependency as expected.

-   `mock_object.assert_called()`: Asserts the mock was called at least once.
-   `mock_object.assert_called_once()`: Asserts the mock was called exactly once.
-   `mock_object.assert_called_with(*args, **kwargs)`: Asserts the mock was last called with specific arguments.
-   `mock_object.assert_called_once_with(*args, **kwargs)`: A combination of the above.
-   `mock_object.call_count`: An integer tracking how many times the mock was called.

These assertions ensure your code is using the dependency correctly (e.g., calling the right API endpoint, using the correct SQL query).
