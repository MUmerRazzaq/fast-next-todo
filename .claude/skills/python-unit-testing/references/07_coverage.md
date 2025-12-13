# Test Coverage Measurement

Test coverage is a metric that measures how much of your production code is executed by your tests. It helps you identify parts of your codebase that are not tested.

## `pytest-cov`

The `pytest-cov` plugin integrates the `coverage.py` tool with `pytest`.

### Installation

```bash
pip install pytest-cov
```

### Basic Usage

To run your tests and generate a coverage report, use the `--cov` flag.

```bash
pytest --cov=my_app
```

-   `--cov=my_app`: This tells `pytest-cov` to measure coverage for the `my_app` package. You should specify your source code directory here.

This will produce a simple report in the terminal:

```
----------- coverage: platform linux, python 3.9.12 -----------
Name                      Stmts   Miss  Cover
---------------------------------------------
src/my_app/__init__.py        0      0   100%
src/my_app/service.py        25      5    80%
src/my_app/utils.py          10     10     0%
---------------------------------------------
TOTAL                        35     15    57%
```

-   **Stmts**: Total number of executable statements.
-   **Miss**: Number of statements not executed by tests.
-   **Cover**: Percentage of statements covered (`(Stmts - Miss) / Stmts`).

### Terminal Report with Missing Lines

For a more detailed report that shows which line numbers are not covered, add `--cov-report=term-missing`.

```bash
pytest --cov=my_app --cov-report=term-missing
```

This will add a `Missing` column to the report, showing the line numbers of uncovered code (e.g., `3-4, 18-22`).

**The `assets/pytest.ini` template is pre-configured to run coverage with this report by default.**

### Generating an HTML Report

For a much richer, browsable report, generate it in HTML format.

```bash
pytest --cov=my_app --cov-report=html
```

This will create a `htmlcov/` directory. Open `htmlcov/index.html` in a web browser to explore your coverage results. You can click on files to see exactly which lines were run and which were missed.

## Interpreting Coverage

-   **High coverage (e.g., >90%)** is good, but it's not a guarantee of good tests. It only tells you that a line of code was *executed*, not that it was asserted correctly.
-   **Low coverage** is a clear sign that you have untested code.
-   Use coverage reports to find gaps in your testing, especially entire functions or conditional branches that are missed. A `if` block that is never entered by your tests is a common source of bugs.

## Setting a Failure Threshold

You can configure `pytest-cov` to fail the test suite if coverage drops below a certain percentage. This is a great way to enforce a minimum standard of testing.

```bash
pytest --cov=my_app --cov-fail-under=90
```
This command will exit with a non-zero status code if the total coverage is less than 90%.

**This is also configured in the `assets/pytest.ini` template.**
