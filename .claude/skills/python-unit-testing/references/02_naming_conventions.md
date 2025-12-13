# Test Naming Conventions

Consistent naming conventions make tests more readable and their intent clearer. `pytest` automatically discovers tests that follow its default naming patterns.

## Test Files

-   Test files should be named `test_*.py` or `*_test.py`.
-   **Best Practice**: Prefer `test_*.py`. It's the most common convention.

**Examples:**
-   `test_authentication.py`
-   `test_user_model.py`

## Test Functions

-   Test functions inside test files must be prefixed with `test`.
-   The rest of the function name should describe what is being tested and under what conditions.

### A Good Naming Pattern: `test_<function_or_method>_<condition_or_state>`

This pattern is descriptive and easy to understand.

**Examples:**

-   `test_add_positive_numbers()`
-   `test_add_negative_numbers()`
-   `test_login_with_valid_credentials()`
-   `test_login_with_invalid_password()`
-   `test_get_user_raises_error_if_not_found()`

### Benefits of Descriptive Names

1.  **Readability**: A good name clearly states the test's purpose. When a test fails, the name immediately tells you what broke.
2.  **No Comments Needed**: The name itself serves as documentation. `test_division_by_zero_raises_exception()` is self-explanatory.
3.  **Better Test Reports**: `pytest` output becomes much more informative with descriptive names.

**Instead of:**
```python
def test_login1(): ...
def test_login2(): ...
```

**Use:**
```python
def test_login_succeeds_with_correct_credentials(): ...
def test_login_fails_with_incorrect_password(): ...
```

## Test Classes

If you group tests inside a class, the class name must be prefixed with `Test`.

```python
class TestUserModel:
    def test_has_full_name(self):
        # ...

    def test_age_is_calculated_correctly(self):
        # ...
```
