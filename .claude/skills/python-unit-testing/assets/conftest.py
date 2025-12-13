import pytest
from unittest.mock import MagicMock

# -----------------
# General Fixtures
# -----------------

@pytest.fixture
def test_user():
    """A sample user object for tests."""
    return {
        "user_id": 123,
        "username": "testuser",
        "email": "test@example.com",
    }


# -----------------
# Mock Fixtures
# -----------------

@pytest.fixture
def mock_db_connection():
    """
    Fixture to mock a database connection.
    It returns a MagicMock object that can be configured in tests.
    """
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor

    # Example: configure a mock query result
    # mock_cursor.fetchone.return_value = ("data",)

    return mock_conn

@pytest.fixture
def mock_api_client():
    """
    Fixture to mock an external API client.
    Returns a MagicMock object.
    """
    mock_client = MagicMock()

    # Example: configure a mock API response
    # mock_response = MagicMock()
    # mock_response.status_code = 200
    # mock_response.json.return_value = {"key": "value"}
    # mock_client.get.return_value = mock_response

    return mock_client

# -----------------
# Fixture for pytest-mock
# -----------------

# The 'mocker' fixture is provided by the pytest-mock plugin.
# It's a thin wrapper around `unittest.mock` with a nicer API.

@pytest.fixture
def mock_external_service(mocker):
    """
    Example of using the 'mocker' fixture from pytest-mock
    to patch an object.
    """
    # Mocks 'my_project.services.external.some_function'
    mocked_function = mocker.patch("my_project.services.external.some_function")

    # Configure the mock's return value
    mocked_function.return_value = "mocked data"

    return mocked_function

