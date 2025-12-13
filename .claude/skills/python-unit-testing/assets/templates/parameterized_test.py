"""
This is a template for a parameterized test using pytest.
"""
import pytest

# Import the function or class to be tested
# from my_module.math_operations import add

# Define the test data as a list of tuples.
# Each tuple represents one test case: (input_1, input_2, expected_output)
ADD_TEST_CASES = [
    (1, 2, 3),          # Positive numbers
    (-1, -1, -2),       # Negative numbers
    (-5, 5, 0),         # Positive and negative
    (0, 0, 0),          # Zeros
    (100, 200, 300),      # Larger numbers
]

@pytest.mark.parametrize("a, b, expected", ADD_TEST_CASES)
def test_add(a, b, expected):
    """
    Test the 'add' function with multiple input combinations.
    The test function will be called once for each tuple in ADD_TEST_CASES.
    """
    # Arrange (already done via parameters)

    # Act
    # result = add(a, b)

    # Assert
    # assert result == expected
    assert (a + b) == expected # Replace with real call


# You can also add IDs to your test cases for clearer output
ADD_TEST_CASES_WITH_IDS = [
    pytest.param(1, 2, 3, id="positive_numbers"),
    pytest.param(-1, -1, -2, id="negative_numbers"),
    pytest.param(-5, 5, 0, id="mixed_sign"),
    pytest.param(0, 0, 0, id="zeros"),
]

@pytest.mark.parametrize("a, b, expected", ADD_TEST_CASES_WITH_IDS)
def test_add_with_ids(a, b, expected):
    """
    Same test as above, but with custom test IDs for better reporting.
    """
    # result = add(a, b)
    # assert result == expected
    assert (a + b) == expected # Replace with real call
