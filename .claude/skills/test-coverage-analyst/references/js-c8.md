# JavaScript Test Coverage with c8

`c8` is a fast code coverage tool for Node.js that uses V8's built-in coverage. It's a great choice for modern JavaScript and TypeScript projects.

## Installation

Install `c8` as a dev dependency:
```bash
npm install c8 --save-dev
# or
yarn add c8 --dev
```

## Configuration

Configuration can be added to `package.json` or a `.nycrc.json` file.

### Example `package.json`

```json
{
  "name": "my-project",
  "scripts": {
    "test": "node_modules/.bin/c8 node_modules/.bin/mocha"
  },
  "c8": {
    "all": true,
    "include": [
      "src/**/*.js"
    ],
    "exclude": [
      "src/config.js",
      "**/__tests__/**"
    ],
    "reporter": [
      "text",
      "html"
    ],
    "check-coverage": true,
    "lines": 80,
    "branches": 80
  }
}
```

### Key Configuration Options

-   `"all": true`: Include all files from `include` in the report, even if they weren't loaded by tests.
-   `"include"`: An array of glob patterns for source files to include.
-   `"exclude"`: An array of glob patterns to exclude from coverage.
-   `"reporter"`: An array of reporters to use (e.g., `text`, `html`, `lcov`).
-   `"check-coverage": true`: Enforce coverage thresholds.
-   `"lines"` / `"branches"` / `"functions"` / `"statements"`: Set minimum percentage thresholds.

## Usage

### Running Coverage

Wrap your test command with `c8`.

```bash
# If configured in package.json scripts
npm test

# Or run directly
npx c8 npm test
# or with a specific test runner
npx c8 mocha
```

### Generating Reports

The reporters are configured in your config file.

**Terminal Report:**
The `text` reporter is shown in the console.

**HTML Report:**
The `html` reporter generates a `coverage/` directory. Open `coverage/index.html` to view the interactive report.

**LCOV Report for CI:**
The `lcov` reporter generates an `lcov.info` file, which is a standard format for CI services. To use it, add `"lcov"` to your `"reporter"` array in the config.
