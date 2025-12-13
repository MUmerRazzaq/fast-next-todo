# Unique Values and Realistic Data

This document covers how to generate unique values using sequences and how to create realistic data using libraries like Faker.

## 1. Sequence Generation

Sequences are used to generate unique values for attributes like usernames or emails.

### Python with `factory_boy`

`factory_boy` provides `factory.Sequence`.

```python
# factories.py
import factory
from .models import User

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')

# Usage
user1 = UserFactory() # username: 'user0', email: 'user0@example.com'
user2 = UserFactory() # username: 'user1', email: 'user1@example.com'
```

### JavaScript with `polly.js`

`polly.js` provides a `sequence()` method on the factory context (`this`).

```javascript
// factories.js
import { Factory } from '@pollyjs/core';
import { User } from './user';

const UserFactory = Factory.extend({
  create(options) {
    const username = `user${this.sequence()}`;
    const email = `${username}@example.com`;

    return new User({
      id: this.id(),
      username: username,
      email: email,
      ...options
    });
  }
});

// Usage
const user1 = UserFactory.create(); // username: 'user1'
const user2 = UserFactory.create(); // username: 'user2'
```

## 2. Realistic Data with Faker

Faker is a popular library for generating fake data like names, addresses, and phone numbers.

### Python with `factory_boy` and `Faker`

First, install `Faker`: `pip install Faker`.

```python
# factories.py
import factory
from faker import Faker

fake = Faker()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.LazyAttribute(lambda _: fake.user_name())
    email = factory.LazyAttribute(lambda _: fake.email())
    first_name = factory.LazyAttribute(lambda _: fake.first_name())
    last_name = factory.LazyAttribute(lambda _: fake.last_name())
```

### JavaScript with `polly.js` and `@faker-js/faker`

First, install faker: `npm install @faker-js/faker --save-dev`.

```javascript
// factories.js
import { Factory } from '@pollyjs/core';
import { faker } from '@faker-js/faker';
import { User } from './user';

const UserFactory = Factory.extend({
  create(options) {
    return new User({
      id: this.id(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      ...options
    });
  }
});
```
