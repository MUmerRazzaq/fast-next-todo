# Relationship Patterns

This document shows how to create factories for models that have relationships with each other.

## 1. One-to-Many Relationships

A common scenario is a `User` who has many `Task`s.

### Python with `factory_boy`

`factory_boy` uses `SubFactory` for foreign key relationships.

```python
# models.py
from django.db import models
# ... (User model from before)

class Task(models.Model):
    title = models.CharField(max_length=100)
    completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
```

The factories would look like this:

```python
# factories.py
import factory
from .models import User, Task
from .factories import UserFactory # Assuming UserFactory is in another file

class TaskFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Task

    title = "Sample Task"
    completed = False
    user = factory.SubFactory(UserFactory) # Creates a User for this task
```

To create a user with multiple tasks, you can use `RelatedFactory`.

```python
# factories.py
class UserFactory(factory.django.DjangoModelFactory):
    # ... (User factory definition)

    # This will create 3 tasks for the user when the user is created
    tasks = factory.RelatedFactory(TaskFactory, factory_name='user', size=3)

# Usage
user_with_tasks = UserFactory()
print(user_with_tasks.tasks.count()) # 3
```

### JavaScript with `polly.js`

In `polly.js`, you can pass factories as attributes.

```javascript
// models
// ... User class
class Task {
  constructor({ id, title, completed, userId }) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.userId = userId;
  }
}

// factories.js
// ... UserFactory
import { Task } from './task';

const TaskFactory = Factory.extend({
  create(options) {
    // If a user is passed in, use its id. Otherwise create a new user.
    const user = options.user || UserFactory.create();

    return new Task({
      id: this.id(),
      title: 'Sample Task',
      completed: false,
      userId: user.id,
      ...options
    });
  }
});
```

Creating a user with tasks is more manual. You would typically do this in your test setup.

```javascript
// test.js
const user = UserFactory.create();
const tasks = [
  TaskFactory.create({ userId: user.id }),
  TaskFactory.create({ userId: user.id }),
];
```

## 2. Many-to-Many Relationships

Consider `Post`s that can have many `Tag`s.

### Python with `factory_boy`

`factory_boy` handles this with a `PostGeneration` hook.

```python
# models.py
class Tag(models.Model):
    name = models.CharField(max_length=50)

class Post(models.Model):
    title = models.CharField(max_length=100)
    tags = models.ManyToManyField(Tag)

# factories.py
class TagFactory(factory.django.DjangoModelFactory):
    class Meta: model = Tag
    name = factory.Sequence(lambda n: f'Tag {n}')


class PostFactory(factory.django.DjangoModelFactory):
    class Meta: model = Post
    title = "A Great Post"

    @factory.post_generation
    def tags(self, create, extracted, **kwargs):
        if not create:
            # Simple build, do nothing.
            return

        if extracted:
            # A list of tags were passed in, use them
            for tag in extracted:
                self.tags.add(tag)
        else:
            # Create a couple of default tags
            self.tags.add(TagFactory(), TagFactory())
```

### JavaScript with `polly.js`

This is typically handled in the test setup logic, similar to one-to-many. You'd create posts and tags, then associate them. Factory composition can help.
