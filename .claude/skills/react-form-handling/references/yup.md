# Yup Schema Examples

Yup is a JavaScript schema builder for value parsing and validation. It has a rich API and has been a popular choice for form validation for a long time.

## Basic Schema

A basic schema defines the shape of your form object.

```ts
import * as yup from 'yup';

const signupSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email().required(),
  age: yup.number().required().positive().integer().min(18, 'You must be at least 18 years old'),
}).required();
```

## Common Validations

### Strings

```ts
// Must not be empty
yup.string().required();

// Must be at least 5 characters
yup.string().min(5);

// Must be a valid email
yup.string().email();

// Must match a regex
yup.string().matches(/(hi|bye)/);
```

### Numbers

```ts
// Must be a number
yup.number();

// Must be an integer
yup.number().integer();

// Must be positive
yup.number().positive();

// Must be greater than or equal to 18
yup.number().min(18);
```

### Booleans

```ts
// Must be a boolean
yup.boolean();

// For checkboxes that must be checked
yup.boolean().oneOf([true], 'You must accept the terms and conditions');
```

### Complex Schemas

#### Password with Confirmation

Use `ref` to refer to another field.

```ts
const passwordSchema = yup.object({
  password: yup.string().min(8).required(),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
}).required();
```

#### Conditional Fields

Use `when` for conditional validation.

```ts
const contactSchema = yup.object({
  contactMethod: yup.string().required(),
  email: yup.string().when('contactMethod', {
    is: 'email',
    then: yup.string().email().required(),
  }),
  phoneNumber: yup.string().when('contactMethod', {
    is: 'phone',
    then: yup.string().min(10).required(),
  }),
});
```

## Using with `react-hook-form`

To use your Yup schema with `react-hook-form`, you need the `@hookform/resolvers` library.

```tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const mySchema = yup.object({ /* ... */ }).required();

// It's a good practice to infer the type from the schema
type FormValues = yup.InferType<typeof mySchema>;

const MyComponent = () => {
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: yupResolver(mySchema),
  });
  // ...
}
```
