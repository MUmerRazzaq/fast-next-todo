# Test File Organization

A clean, predictable test structure makes it easy to find tests and understand coverage. The standard approach is to mirror your source code directory structure inside your `tests` directory.

## Mirrored Structure

For a source file at `src/my_app/utils/helpers.py`, the corresponding test file should be located at `tests/my_app/utils/test_helpers.py`.

### Example

**Source Layout:**
```
my_project/
├── src/
│   └── my_app/
│       ├── __init__.py
│       ├── components/
│       │   ├── __init__.py
│       │   └── user_profile.py
│       └── services/
│           ├── __init__.py
│           └── authentication.py
└── tests/
    └── ...
```

**Corresponding Test Layout:**
```
my_project/
├── src/
│   └── ...
└── tests/
    └── my_app/
        ├── __init__.py
        ├── components/
        │   ├── __init__.py
        │   └── test_user_profile.py
        └── services/
            ├── __init__.py
            └── test_authentication.py
```

### Key Principles

1.  **`tests` Directory**: All tests live in a top-level `tests` directory.
2.  **Mirroring**: The package structure within `tests` mirrors the package structure within `src`.
3.  **`test_` Prefix**: Test files are named by prefixing the module name with `test_`. For `authentication.py`, the test file is `test_authentication.py`.
4.  **`__init__.py` Files**: Include `__init__.py` files in test subdirectories to ensure they are treated as Python packages. This is important for Python's import system to work correctly, especially for older Python versions.

This structure ensures that tests are organized, discoverable, and clearly mapped to the code they are testing.
