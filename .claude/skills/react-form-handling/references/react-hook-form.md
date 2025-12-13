# React Hook Form Setup and Best Practices

`react-hook-form` is a performant, flexible, and extensible forms library for React. It minimizes the number of re-renders, which makes it very fast.

## Installation

First, install the necessary packages:

```bash
npm install react-hook-form @hookform/resolvers
```

If you are using Zod (recommended):

```bash
npm install zod
```

If you are using Yup:

```bash
npm install yup
```

## Core Setup Template

Here is a basic template for setting up a form with `react-hook-form` and a `zod` schema resolver.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define your form schema with Zod
const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

// Infer the type from the schema
type FormData = z.infer<typeof schema>;

const MyForm = () => {
  // 2. Set up the form with useForm
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur', // Validate on blur
  });

  // 3. Define the submit handler
  const onSubmit = async (data: FormData) => {
    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(data);
    // Reset the form after submission if needed
    // reset();
  };

  // 4. Build the UI
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default MyForm;
```

## Best Practices

-   **Type Safety**: Always infer your form's type from your validation schema. This ensures your form data is fully typed.
-   **Validation Mode**: `onBlur` is a good default for `mode`. It provides a good user experience without being too aggressive. `onChange` can be noisy, while `onSubmit` (the default) might be too late for providing feedback.
-   **`isSubmitting` state**: Always use the `isSubmitting` state from `formState` to disable your submit button and provide visual feedback to the user. This prevents duplicate submissions.
-   **Error Display**: Use the `errors` object to display contextual error messages next to the corresponding fields.
-   **Reusable Components**: For larger applications, create reusable, controlled components for your form inputs. The components in `assets/components/` are a good starting point. They show how to use `Controller` or `register` to integrate with `react-hook-form`.
