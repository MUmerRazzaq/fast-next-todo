# Custom Validators

For complex validation logic that can't be expressed with `Field`, you can create custom validator functions.

## Using `@validator`

Use the `@validator` decorator from Pydantic to define a custom validation function for a field.

### Email Validation

Here's an example of a simple regex-based email validator. For production, a more robust library might be better.

```python
from pydantic import BaseModel, validator
import re

class User(BaseModel):
    email: str

    @validator('email')
    def validate_email(cls, v):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", v):
            raise ValueError('Invalid email address')
        return v
```

### Password Strength

This validator checks for password length, and presence of numbers and letters.

```python
from pydantic import BaseModel, validator

class UserRegistration(BaseModel):
    password: str

    @validator('password')
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c.isalpha() for c in v):
            raise ValueError('Password must contain at least one letter')
        return v
```

You can find more complete examples of validators in `scripts/validators.py`.
