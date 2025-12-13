# CI Integration for Coverage

Integrating coverage analysis into your Continuous Integration (CI) pipeline provides automated feedback on every pull request.

## GitHub Actions Example with Codecov

This example shows how to run coverage and upload the report to [Codecov](https://codecov.io/) in a GitHub Actions workflow. Codecov provides visualizations, trend analysis, and status checks on pull requests.

### 1. Generate Coverage Report

First, ensure your test command generates a coverage report in a format Codecov understands (e.g., XML for Python, LCOV for JS).

-   **Python (`pytest-cov`)**: Use `--cov-report=xml` to create `coverage.xml`.
-   **JavaScript (`c8`)**: Use the `lcov` reporter to create `lcov.info`.

### 2. GitHub Actions Workflow (`.github/workflows/ci.yml`)

This workflow runs on every push and pull request. It checks out the code, runs tests with coverage, and then uploads the report.

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    # For Python projects
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.x'
    - name: Install dependencies
      run: pip install -r requirements.txt
    - name: Run tests and generate coverage report
      run: pytest --cov --cov-report=xml

    # For JavaScript projects
    # - name: Set up Node.js
    #   uses: actions/setup-node@v3
    #   with:
    #     node-version: '18'
    # - name: Install dependencies
    #   run: npm install
    # - name: Run tests and generate coverage report
    #   run: npx c8 --reporter=lcov npm test

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        # token: ${{ secrets.CODECOV_TOKEN }} # Not required for public repos
        fail_ci_if_error: true
```

### Notes:

-   Uncomment the appropriate section for your project (Python or JS).
-   The `codecov/codecov-action` will automatically find the coverage report file (`coverage.xml` or `lcov.info`).
-   For private repositories, you'll need to add a `CODECOV_TOKEN` to your GitHub repository secrets.
