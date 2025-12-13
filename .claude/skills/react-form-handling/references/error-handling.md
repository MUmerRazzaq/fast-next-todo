# Error Message Display Strategies

Displaying clear, contextual error messages is crucial for a good user experience. `react-hook-form` makes this easy with the `errors` object from the `formState`.

## Basic Error Display

The simplest way to display an error is to conditionally render a paragraph tag if an error for a specific field exists.

```tsx
const { register, formState: { errors } } = useForm();

<input {...register('email')} />
{errors.email && <p className="error-message">{errors.email.message}</p>}
```
Make sure to style the `.error-message` class to make it stand out (e.g., with a red color).

## Reusable Error Message Component

For larger applications, it's a good idea to create a reusable component to display error messages. This ensures consistency.

```tsx
// ErrorMessage.tsx
import React from 'react';
import { FieldError } from 'react-hook-form';

interface ErrorMessageProps {
  error?: FieldError;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;

  return <p className="error-message">{error.message}</p>;
};

export default ErrorMessage;
```

And in your form:

```tsx
import ErrorMessage from './ErrorMessage';

// ...
<input {...register('email')} />
<ErrorMessage error={errors.email} />
```

## Form-Level Error Messages

Sometimes you have errors that are not specific to a single field, but apply to the form as a whole. For example, an API might return an error like "Invalid credentials".

You can use the `setError` function from `react-hook-form` to manually set these errors.

```tsx
const { setError, formState: { errors } } = useForm();

const onSubmit = async (data) => {
  try {
    await api.login(data);
  } catch (error) {
    // Assuming the API returns a clear error message
    setError('root.serverError', {
      type: 'manual',
      message: error.message || 'An unexpected error occurred.',
    });
  }
};

// In your JSX
{errors.root?.serverError && (
  <p className="error-message">{errors.root.serverError.message}</p>
)}
```
The `root` key is a convention for form-level errors. You can use any name that doesn't conflict with your field names.

## Accessibility (ARIA)

To make your forms more accessible, use ARIA attributes to associate your input fields with their error messages.

-   `aria-invalid`: Set to `true` on the input when there's an error.
-   `aria-describedby`: Point this to the `id` of your error message element.

Here is an example:

```tsx
const { register, formState: { errors } } = useForm();
const emailError = errors.email;

<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    {...register('email')}
    aria-invalid={emailError ? "true" : "false"}
    aria-describedby="email-error"
  />
  {emailError && (
    <p id="email-error" role="alert" className="error-message">
      {emailError.message}
    </p>
  )}
</div>
```
The reusable components in `assets/components/` can be extended to include these ARIA attributes automatically.
