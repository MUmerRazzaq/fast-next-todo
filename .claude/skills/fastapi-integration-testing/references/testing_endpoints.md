# Guide to Testing API Endpoints

This guide provides patterns for testing common API endpoint scenarios.

## Basic Endpoint Testing

The `TestClient` allows you to call your endpoints just like an HTTP client.

### GET Request

To test a `GET` endpoint, use `client.get()` and assert the status code and response body.

```python
def test_get_item(client: TestClient):
    # Assuming an item with ID 1 exists
    response = client.get("/items/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert "name" in data
```

### POST Request

To test a `POST` endpoint, use `client.post()` with a `json` payload.

```python
def test_create_item(client: TestClient, db_session: Session):
    item_data = {"name": "New Gadget", "price": 99.99}
    response = client.post("/items/", json=item_data)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == item_data["name"]

    # Optionally, verify the data was saved to the database
    # new_item = db_session.query(Item).filter_by(id=data["id"]).one()
    # assert new_item.name == "New Gadget"
```

### PUT/PATCH Request

Testing `PUT` or `PATCH` is similar to `POST`.

```python
def test_update_item(client: TestClient):
    # Assuming an item with ID 1 exists
    update_data = {"price": 129.99}
    response = client.put("/items/1", json=update_data)
    assert response.status_code == 200
    assert response.json()["price"] == 129.99
```

### DELETE Request

For `DELETE` requests, verify the status code and that the resource is gone.

```python
def test_delete_item(client: TestClient):
    # Assuming an item with ID 1 exists
    response = client.delete("/items/1")
    assert response.status_code == 204 # Or 200 with a success message

    # Verify the item is deleted
    get_response = client.get("/items/1")
    assert get_response.status_code == 404
```

See `assets/test_api_template.py` for a runnable template file.
