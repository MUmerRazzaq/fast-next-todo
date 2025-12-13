# Persistence Strategies

Factories can generate in-memory objects (structs, classes) or create records in a database. This document explains the difference and how to control the persistence strategy.

## 1. In-Memory vs. Database-Backed

- **In-Memory (Build/BuildList)**: Creates an instance of the model class but does **not** save it to the database. This is useful for tests that don't require database interaction, like testing model methods or controller logic that doesn't depend on database state. This is faster as it avoids database writes.
- **Database-Backed (Create/CreateList)**: Creates an instance of the model class **and** saves it to the database. This is necessary for integration tests that check database constraints, query logic, or anything that requires the data to exist in the database.

## 2. Controlling Persistence

### Python with `factory_boy`

`factory_boy` provides different "strategies" for building or creating objects.

- `UserFactory.build()`: Creates a `User` instance in memory.
- `UserFactory.create()`: Creates a `User` instance and saves it to the database.
- `UserFactory.build_batch(5)`: Creates a list of 5 `User` instances in memory.
- `UserFactory.create_batch(5)`: Creates a list of 5 `User` instances and saves them to the database.

```python
# test.py

# In-memory user object
user_built = UserFactory.build(username='testbuild')
print(user_built.id) # None, because it's not saved

# Database-backed user object
user_created = UserFactory.create(username='testcreate')
print(user_created.id) # e.g., 1, because it's saved and has a primary key
```

The default strategy is `create`. You can change this in the `Meta` class.

```python
# factories.py
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        strategy = factory.BUILD_STRATEGY # Default to build
```

### JavaScript with `polly.js`

`polly.js` itself is persistence-agnostic. It just creates objects. The persistence logic is typically handled by the adapter you use with it, for example `@pollyjs/adapter-node-http` for intercepting http requests.

However, if you are using an ORM like Sequelize or TypeORM, you would integrate the persistence step into your factory or test.

A common pattern is to have the factory just create the object data, and then have a separate step in your test to save it.

```javascript
// factories.js
import { Factory } from '@pollyjs/core';
// ...
const UserFactory = Factory.extend({
  create(options) {
    // Just creates a plain object with user data
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      ...options
    };
  }
});

// test.js
import { User } from '../models'; // e.g., a Sequelize model

// In-memory object
const user_data = UserFactory.create();

// Database-backed
async function test() {
  const user = await User.create(UserFactory.create());
  console.log(user.id); // Will have an ID
}
```
