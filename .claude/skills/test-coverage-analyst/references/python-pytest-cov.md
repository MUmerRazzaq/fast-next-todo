# Python Test Coverage with pytest-cov

This guide provides detailed instructions for configuring and using `pytest-cov` for Python projects.

## Installation

Install `pytest-cov` using pip:
```bash
pip install pytest pytest-cov
```

## Configuration

Configuration can be stored in `pyproject.toml`, `setup.cfg`, or `.coveragerc`. `pyproject.toml` is the modern standard.

### Example `pyproject.toml`

```toml
[tool.coverage.run]
source = ["src"]  # Directory containing your source code
omit = [
    "src/config.py",
    "src/migrations/*",
]
branch = true  # Enable branch coverage

[tool.coverage.report]
show_missing = true
fail_under = 80  # Enforce a minimum coverage threshold of 80%

[tool.coverage.html]
directory = "coverage_html_report"
```

### Key Configuration Options

-   **`[tool.coverage.run]`**:
    -   `source`: Specifies the directory/package(s) to measure coverage for.
    -   `omit`: A list of file patterns to exclude from coverage analysis. Useful for configuration, migrations, or vendored code.
    -   `branch`: Set to `true` to enable branch coverage analysis, which is more thorough than just line coverage.
-   **`[tool.coverage.report]`**:
    -   `show_missing`: Shows the line numbers of code that are not executed.
    -   `fail_under`: Fails the command if the total coverage is below this threshold. Essential for CI.
-   **`[tool.coverage.html]`**:
    -   `directory`: Specifies the output directory for the HTML report.

## Usage

### Running Coverage

Run pytest with the `--cov` flag.
```bash
# Basic usage, pointing to your source directory
pytest --cov=src

# Run with all configurations from pyproject.toml
pytest --cov
```

### Generating Reports

You can generate various report formats.

**Terminal Report:**
This is the default output.
```bash
pytest --cov
```

**HTML Report:**
An interactive HTML report is great for local exploration.
```bash
pytest --cov --cov-report=html
```
This will generate a report in the directory specified in your config (e.g., `coverage_html_report`). Open `index.html` in that directory to view it.

**XML Report:**
XML reports are commonly used by CI/CD platforms like Codecov or Coveralls.
```bash
pytest --cov --cov-report=xml
```
This will create a `coverage.xml` file.
