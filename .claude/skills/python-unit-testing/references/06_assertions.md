# Assertion Best Practices

The assertion is the most critical part of a test—it's where you verify that your code produced the correct outcome. `pytest` enhances Python's standard `assert` statement to provide detailed feedback on failures.

## Use Plain `assert`

With `pytest`, you should almost always use the plain `assert` statement. `pytest`'s "assertion introspection" will automatically provide rich and informative output on failures.

**Don't do this (old `unittest` style):**
```python
self.assertEqual(result, expected)
self.assertTrue(is_valid)
```

**Do this (pytest style):**
```python
assert result == expected
assert is_valid
```

### Example Failure Output

If you have `assert "hello" == "hEllo"`, `pytest` will give you a detailed diff:
```
E   AssertionError: assert 'hello' == 'hEllo'
E     - hEllo
E     ?  ^
E     + hello
E     ?  ^
```
This is far more useful than a simple `AssertionError`.

## Be Specific

Your assertion should be as specific as possible.

**Less specific (avoid):**
```python
# If this fails, you don't know if the user is None or if the name is wrong.
assert get_user(1) == {"id": 1, "name": "test"}
```

**More specific (preferred):**
```python
user = get_user(1)
assert user is not None
assert user["id"] == 1
assert user["name"] == "test"
```
If this fails, you'll know exactly which part of the user data was incorrect.

## Testing for Exceptions with `pytest.raises`

To check that a function raises an exception under certain conditions, use `pytest.raises` as a context manager.

```python
import pytest

def my_division(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def test_division_by_zero():
    with pytest.raises(ValueError):
        my_division(10, 0)
```
The test passes if a `ValueError` is raised inside the `with` block, and fails otherwise.

You can also inspect the exception instance itself:
```python
def test_division_error_message():
    with pytest.raises(ValueError) as excinfo:
        my_division(10, 0)
    # Check that the exception message is correct
    assert "Cannot divide by zero" in str(excinfo.value)
```

## Other Common Assertions

-   **Membership**: `assert item in container`
-   **Type**: `assert isinstance(obj, ExpectedType)`
-   **Floating point comparison (with tolerance)**: `assert a == pytest.approx(b)`
-   **Truthiness**: `assert result` / `assert not result`
