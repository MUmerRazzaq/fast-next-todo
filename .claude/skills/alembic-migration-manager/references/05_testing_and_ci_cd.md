# Testing and CI/CD

## 1. Testing Strategies

-   **Linearity Test**: Ensure the full migration history can be run from an empty database to the latest version.
    ```bash
    # On a test DB
    alembic upgrade head
    ```
-   **Reversibility Test**: Ensure every migration can be upgraded and then downgraded without errors.
    ```bash
    # A script to loop through all migrations
    for rev in $(alembic history --verbose | grep "Revision ID" | awk '{print $3}'); do
        alembic upgrade $rev
        alembic downgrade $rev
    done
    ```
-   **Idempotency Test**: Run `alembic upgrade head` multiple times to ensure it does not cause errors. `autogenerate` should produce an empty migration if the schema is up to date.

## 2. CI/CD Integration

Your CI pipeline should automatically run tests on every pull request that contains a new migration file.

### Example GitHub Action Workflow

```yaml
name: Test Alembic Migrations

on:
  pull_request:
    paths:
      - 'alembic/versions/**.py'

jobs:
  test_migrations:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: testdb
        ports: ['5432:5432']

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v3
        with:
          python-version: '3.9'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run Alembic upgrade head
        env:
          DATABASE_URL: "postgresql://user:password@localhost/testdb"
        run: alembic upgrade head

      - name: Check for empty autogenerate
        env:
          DATABASE_URL: "postgresql://user:password@localhost/testdb"
        run: |
          if alembic revision --autogenerate | grep -q "INFO  \[alembic.autogenerate.compare\] Detected"; then
            echo "Autogenerate is not empty after upgrade head. Schema mismatch."
            exit 1
          fi
```
