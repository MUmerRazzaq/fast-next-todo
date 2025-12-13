# Using Test Data Factories

For complex applications, creating test data manually for each test can be tedious and repetitive. Test data factories help you generate test model instances programmatically. `factory-boy` is a popular library for this.

**To install**: `pip install factory-boy`

## 1. Defining a Factory

Create a factory for each of your SQLAlchemy models. This is often done in a `tests/factories.py` file.

```python
# in tests/factories.py
import factory
from factory.alchemy import SQLAlchemyModelFactory
from my_app.models import User, Item
from my_app.database import SessionLocal # Your app's session

class BaseFactory(SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        sqlalchemy_session = SessionLocal()
        sqlalchemy_session_persistence = "commit"

class UserFactory(BaseFactory):
    class Meta:
        model = User

    id = factory.Sequence(lambda n: n)
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    is_active = True
    # For password, you'd likely want to hash it
    password = "hashed_password"


class ItemFactory(BaseFactory):
    class Meta:
        model = Item

    id = factory.Sequence(lambda n: n)
    name = factory.Faker("word")
    description = factory.Faker("sentence")
    price = factory.Faker("pyfloat", left_digits=2, right_digits=2, positive=True)
    # Associate with a user
    owner = factory.SubFactory(UserFactory)
```

## 2. Using Factories in Tests

You can now use these factories in your tests to create prerequisite data.

### In Pytest Fixtures

Factories are very powerful when combined with fixtures in `conftest.py`.

```python
# in conftest.py
import pytest
from .factories import UserFactory, ItemFactory

@pytest.fixture
def test_user():
    return UserFactory()

@pytest.fixture
def test_item(test_user):
    # Create an item owned by the test_user
    return ItemFactory(owner=test_user)
```

### In Test Functions

You can then use these fixtures or call the factories directly inside your tests.

```python
from .factories import ItemFactory

def test_get_item(client: TestClient, db_session: Session):
    # Use the factory to create an item in the database
    item = ItemFactory(name="My Test Item", price=123.45)

    response = client.get(f"/items/{item.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "My Test Item"
    assert data["price"] == 123.45
```

### Benefits of Using Factories

-   **Readability**: Tests focus on the data relevant to the test, not boilerplate creation.
-   **Maintainability**: If your model changes, you only need to update the factory, not every test.
-   **Reusability**: Easily create complex object graphs.
-   **Realism**: Use `factory.Faker` to generate realistic-looking data.
