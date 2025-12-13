# Test Coverage Improvement Strategies

High test coverage doesn't guarantee bug-free code, but low coverage is a clear sign of untested logic. Here's how to analyze and improve your coverage.

## Line vs. Branch Coverage

-   **Line Coverage**: Measures if each executable line of code was run. It's the simplest metric.
-   **Branch Coverage**: Measures if each branch of a control structure (like an `if` statement) was executed. For an `if/else`, it checks if both the `if` and the `else` blocks were executed.

**Branch coverage is a stronger metric.** 100% branch coverage implies 100% line coverage, but not the other way around. Always aim to improve branch coverage.

### Example

Consider this function:
```python
def get_grade(score):
    if score >= 90:
        return "A"
    return "B"
```
-   A test with `score = 95` achieves **100% line coverage** (lines 2, 3, and 4 are hit).
-   However, it only achieves **50% branch coverage** because the `else` path (line 4) is taken implicitly, but the `if` condition being `False` was never tested with a value < 90.
-   To get 100% branch coverage, you need a second test, e.g., `score = 80`.

## Identifying Untested Code

Use the **HTML report** to find untested code. It provides a visual, line-by-line view of your codebase:
-   Green lines are covered.
-   Red lines are uncovered.
-   Yellow lines indicate a branch that was not fully covered.

Focus your efforts on the red and yellow sections.

## Strategies for Improving Coverage

1.  **Test the "Happy Path"**: Ensure every function has at least one test that covers its main, successful execution path.
2.  **Test Error Conditions and Edge Cases**:
    -   What happens if a function receives invalid input (`null`, `undefined`, wrong type)?
    -   Test `if/else` and `switch` statements. Make sure every path is taken.
    -   Test `try/catch` blocks. Do you have a test that causes an error to be thrown and caught?
3.  **Parameterize Tests**: Instead of writing separate tests for similar inputs, use test parameterization to cover many cases with one test function. `pytest.mark.parametrize` is excellent for this.
4.  **Focus on Business Logic**: Prioritize testing complex business logic over simple getters/setters.
5.  **Exclude Non-Relevant Files**: Use the `omit` or `exclude` configuration to ignore files that don't need testing (e.g., config files, database migrations, auto-generated code). This gives you a more realistic coverage score.
