# Testing Error Responses

It's crucial to test that your API handles errors correctly and returns appropriate HTTP status codes and error messages.

## Testing 404 Not Found

Test that your API returns a 404 error when a client requests a resource that does not exist.

```python
def test_get_non_existent_item(client: TestClient):
    response = client.get("/items/99999") # Assuming item 99999 does not exist
    assert response.status_code == 404
    assert response.json() == {"detail": "Item not found"}
```

## Testing 422 Unprocessable Entity (Validation Errors)

FastAPI automatically handles request validation. Your tests should verify that invalid payloads result in a 422 error.

### Missing Required Field

```python
def test_create_item_with_missing_field(client: TestClient):
    # The 'price' field is missing from the payload
    invalid_payload = {"name": "Incomplete Item"}
    response = client.post("/items/", json=invalid_payload)

    assert response.status_code == 422
    error_detail = response.json()["detail"]
    # FastAPI provides detailed validation error messages
    assert error_detail[0]["msg"] == "field required"
    assert error_detail[0]["loc"] == ["body", "price"]
```

### Invalid Data Type

```python
def test_create_item_with_invalid_data_type(client: TestClient):
    # The 'price' field should be a float, not a string
    invalid_payload = {"name": "Item With Bad Price", "price": "not-a-number"}
    response = client.post("/items/", json=invalid_payload)

    assert response.status_code == 422
    error_detail = response.json()["detail"]
    assert error_detail[0]["msg"] == "value is not a valid float"
    assert error_detail[0]["loc"] == ["body", "price"]
```

## Testing Custom Exceptions

If you have custom exception handlers, write tests to ensure they are triggered correctly.

Imagine you have a custom exception `InactiveUserException` and a handler that returns a 400 error.

```python
# In your main application:
# class InactiveUserException(Exception):
#     ...
#
# @app.exception_handler(InactiveUserException)
# async def inactive_user_exception_handler(request: Request, exc: InactiveUserException):
#     return JSONResponse(
#         status_code=400,
#         content={"message": "Cannot perform action: User is inactive."},
#     )

# In your tests:
def test_action_for_inactive_user(client: TestClient):
    # This test would need to set up a scenario where the user is inactive
    # For example, by using an authenticated client for an inactive user
    response = client.post("/perform-action-for-inactive-user/")

    assert response.status_code == 400
    assert response.json() == {"message": "Cannot perform action: User is inactive."}
```
