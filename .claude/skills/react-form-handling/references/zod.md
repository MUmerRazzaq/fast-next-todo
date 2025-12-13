# Zod Schema Examples

Zod is a TypeScript-first schema declaration and validation library. It's highly recommended for use with `react-hook-form` due to its excellent type inference.

## Basic Schema

A basic schema defines the shape of your form object.

```ts
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email(),
  age: z.number().min(18, { message: 'You must be at least 18 years old' }),
});
```

## Common Validations

### Strings

```ts
// Must not be empty
z.string().min(1, "Required");

// Must be at least 5 characters
z.string().min(5);

// Must be a valid email
z.string().email();

// Must be a valid URL
z.string().url();
```

### Numbers

```ts
// Must be a number
z.number();

// Must be an integer
z.number().int();

// Must be positive
z.number().positive();

// Must be greater than or equal to 18
z.number().gte(18);
```

### Booleans

```ts
// Must be a boolean
z.boolean();

// For checkboxes that must be checked (e.g., agreeing to terms)
z.literal(true, {
  errorMap: () => ({ message: 'You must accept the terms and conditions' }),
});
```

### Complex Schemas

#### Password with Confirmation

Use `refine` for validations that depend on multiple fields.

```ts
const passwordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});
```

#### Conditional Fields

You can use `discriminatedUnion` for conditional fields.

```ts
const contactSchema = z.discriminatedUnion("contactMethod", [
  z.object({
    contactMethod: z.literal("email"),
    email: z.string().email(),
  }),
  z.object({
    contactMethod: z.literal("phone"),
    phoneNumber: z.string().min(10),
  }),
]);
```

## Using with `react-hook-form`

To use your Zod schema with `react-hook-form`, you need the `@hookform/resolvers` library.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const mySchema = z.object({ /* ... */ });

type FormValues = z.infer<typeof mySchema>;

const MyComponent = () => {
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(mySchema),
  });
  // ...
}
```
