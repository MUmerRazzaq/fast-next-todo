# Testing Endpoints with Authentication

Testing protected endpoints requires generating and sending authentication tokens with your requests.

## 1. Fixture for an Authenticated Client

The best practice is to create a `pytest` fixture that provides an authenticated `TestClient`. This fixture would handle user creation and token generation.

```python
# In conftest.py

@pytest.fixture(scope="module")
def authenticated_client(client: TestClient) -> TestClient:
    """
    Fixture to provide an authenticated client.
    It creates a test user and gets a token.
    """
    # 1. Create a test user in the database
    test_user = {"email": "test@example.com", "password": "testpassword"}
    client.post("/users/", json=test_user) # Assuming you have a user creation endpoint

    # 2. Authenticate and get a token
    login_data = {"username": test_user["email"], "password": test_user["password"]}
    response = client.post("/token", data=login_data) # Assuming a standard OAuth2 endpoint
    token = response.json()["access_token"]

    # 3. Set the authorization header for the client
    client.headers["Authorization"] = f"Bearer {token}"

    return client
```

**Note**: This is a simple example. You might need to adapt it to your specific user creation and authentication logic (e.g., if you need to activate a user first).

## 2. Using the Authenticated Client in Tests

Now you can use the `authenticated_client` fixture in your tests for protected endpoints.

```python
def test_read_protected_resource(authenticated_client: TestClient):
    """
    Test a protected endpoint using the authenticated client.
    """
    response = authenticated_client.get("/protected-resource")
    assert response.status_code == 200
    assert "user_specific_data" in response.json()

```

## Testing Unauthenticated Access

You can still use the regular `client` fixture to test that unauthenticated users are correctly denied access.

```python
def test_unauthenticated_access_to_protected_resource(client: TestClient):
    """
    Ensure unauthenticated users get a 401 Unauthorized error.
    """
    response = client.get("/protected-resource")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
```
