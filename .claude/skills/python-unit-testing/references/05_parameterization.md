# Parameterized Test Patterns

Parameterization allows you to run the same test function with different input values. It's a great way to test a variety of conditions with minimal code duplication.

## `@pytest.mark.parametrize`

The primary tool for parameterization in `pytest` is the `@pytest.mark.parametrize` decorator.

### Basic Usage

The decorator takes two main arguments:
1.  A string with comma-separated names for the arguments (`"input,expected"`).
2.  A list of values for those arguments. Each element in the list is a tuple that corresponds to one run of the test.

```python
# in my_app/validation.py
def is_valid_email(email):
    return "@" in email and "." in email.split("@")[-1]

# in tests/test_validation.py
import pytest
from my_app.validation import is_valid_email

@pytest.mark.parametrize("email, expected_result", [
    ("test@example.com", True),      # Valid case
    ("invalid-email", False),        # Invalid case (no @)
    ("test@domain", False),          # Invalid case (no . after @)
    ("", False),                     # Edge case: empty string
    ("another.test@sub.domain.co.uk", True), # Valid complex case
])
def test_is_valid_email(email, expected_result):
    """Test the is_valid_email function with various inputs."""
    assert is_valid_email(email) == expected_result
```
In this example, `test_is_valid_email` will be run 5 times, once for each tuple in the list.

**See `assets/templates/parameterized_test.py` for a runnable example.**

## Adding Test IDs

When a parameterized test fails, the default output can be verbose, showing the full input values. You can provide custom test IDs for clearer reporting using `pytest.param`.

```python
import pytest

@pytest.mark.parametrize("email, expected_result", [
    pytest.param("test@example.com", True, id="valid_email"),
    pytest.param("invalid-email", False, id="invalid_no_at_symbol"),
    pytest.param("test@domain", False, id="invalid_no_dot_in_domain"),
    pytest.param("", False, id="edge_case_empty_string"),
])
def test_is_valid_email_with_ids(email, expected_result):
    assert is_valid_email(email) == expected_result
```

Now, if a test fails, the report will show the `id` (e.g., `FAILED test_validation.py::test_is_valid_email_with_ids[invalid_no_at_symbol]`). This is much more readable.

## When to Parameterize

Parameterize tests when:
-   You have a function whose logic depends on its input values.
-   You want to test multiple boundary or edge cases for the same function.
-   You find yourself writing several test functions that follow the exact same Arrange-Act-Assert pattern but with different data.
