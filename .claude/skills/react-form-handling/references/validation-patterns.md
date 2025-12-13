# Form Validation Patterns

This guide covers different validation strategies you can use in your forms.

## Field-Level vs. Form-Level Validation

With `react-hook-form`, validation is typically performed at the form level using a schema from a library like Zod or Yup. This is the recommended approach as it co-locates all your validation logic in one place, making it easier to manage.

**Form-Level Validation (Recommended)**

```tsx
// All validation logic is in the schema
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});

// errors.email and errors.password will be populated based on the schema
```

**Field-Level Validation**

While less common, you can also define validation rules directly on your inputs using the `register` function. This can be useful for simple, one-off validations that don't seem to fit into a schema.

```tsx
<input
  {...register('username', {
    required: 'Username is required',
    minLength: {
      value: 5,
      message: 'Username must be at least 5 characters',
    },
  })}
/>
```

**When to use which?**
-   **Form-Level**: Use for almost all cases. It's more maintainable and declarative.
-   **Field-Level**: Use for very simple forms or for validations that are highly specific to a single component and not easily expressed in a schema.

## Async Validation

Async validation is often needed for tasks like checking if a username or email is already taken. `react-hook-form` supports this out of the box. With Zod, you can use `.refine()` with an async function.

Here's an example of checking for username uniqueness:

```ts
import { z } from 'zod';

// A mock API function to check username availability
const isUsernameAvailable = async (username: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
  return username !== 'admin';
};

const schema = z.object({
  username: z.string().min(3)
    .refine(async (username) => {
      // Don't run validation if the username is too short
      if (username.length < 3) return true;
      return await isUsernameAvailable(username);
    }, {
      message: 'This username is already taken.',
    }),
  // ... other fields
});

// In your form component
const { formState: { errors, isValidating } } = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Important for async validation to not run on every keystroke
});
```

### Best Practices for Async Validation

1.  **Use `onBlur` or `onChange` with debouncing:** You don't want to fire off an API request on every keystroke. Using `mode: 'onBlur'` is the simplest way to achieve this.
2.  **Use the `isValidating` state:** `react-hook-form` provides an `isValidating` flag in `formState`. You can use this to show a loading spinner or other feedback to the user while the async validation is in progress.
3.  **Handle server errors:** Your API call might fail. Make sure to handle errors gracefully within your async validation function. A `try...catch` block can be useful here.
4.  **Debounce `onChange` (if you must use it):** If you need validation to happen as the user types, you should debounce the function passed to `refine` to avoid overwhelming your server with requests.
