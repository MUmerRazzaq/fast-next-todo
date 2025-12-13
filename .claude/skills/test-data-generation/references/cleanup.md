# Data Cleanup Strategies

To ensure tests are isolated and repeatable, it's crucial to clean up data created by factories after each test run.

## 1. Database Transaction Strategy

The most common and efficient strategy is to wrap each test in a database transaction and roll it back after the test completes. This automatically discards any data created during the test.

Most modern testing frameworks for web applications (e.g., Django, Ruby on Rails) do this by default for their test runners.

### Python with `pytest-django`

If you are using `pytest-django`, your tests are automatically wrapped in a transaction.

```python
# tests.py
import pytest
from .factories import UserFactory

@pytest.mark.django_db
def test_user_creation():
    user = UserFactory()
    # ... assertions ...
    # The user record will be automatically removed after this test
```

## 2. Truncation Strategy

If you cannot use transactions (e.g., for certain types of integration or end-to-end tests), another strategy is to truncate the relevant database tables between tests. This is slower than transaction rollbacks but effective.

Libraries like `database_cleaner` (Ruby) or `pytest-datacleaner` (Python) can help automate this.

### Example with a manual cleanup hook

Many test runners provide `beforeEach` and `afterEach` hooks where you can implement cleanup.

```javascript
// jest-setup.js (example for Jest)
import { database } from './db'; // Your db connection

beforeEach(async () => {
  // Or start a transaction
});

afterEach(async () => {
  // Clean all tables
  await database.truncateAllTables();
  // Or rollback transaction
});
```

## 3. Factory-level Cleanup

Some factory libraries provide their own cleanup utilities.

### Python with `factory_boy`

`factory_boy` doesn't have a built-in cleanup utility because it's designed to be persistence-agnostic. Cleanup is considered the responsibility of the testing framework.

### JavaScript with `polly.js`

`polly.js` is also persistence-agnostic. However, libraries that are often used with it for testing might have cleanup features. For example, if you are using something like `Mirage JS` for mocking a server, it has its own server shutdown method.

```javascript
// test.js
import { createServer } from "miragejs"

let server

beforeEach(() => {
  server = createServer({
    factories: {
      // ... your factories
    }
  })
})

afterEach(() => {
  server.shutdown()
})
```

**Recommendation:** Rely on your testing framework's database handling (like transaction-based tests) as the primary method for data cleanup. It's the most reliable and efficient approach.
