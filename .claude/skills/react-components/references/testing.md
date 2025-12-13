# Testing with React Testing Library

## Setup

```bash
npm i -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

## Basic Pattern

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

test('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  await userEvent.click(screen.getByRole('button', { name: /click me/i }));

  expect(handleClick).toHaveBeenCalledOnce();
});
```

## Query Priority (Use in Order)

1. `getByRole` - accessible name (buttons, inputs, headings)
2. `getByLabelText` - form fields
3. `getByPlaceholderText` - when label unavailable
4. `getByText` - non-interactive elements
5. `getByTestId` - last resort

## Async Queries

```tsx
// Wait for element to appear
await screen.findByRole('alert');

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText('Loading'));
```

## Testing Forms

```tsx
test('submits form data', async () => {
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password123');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

## Testing Accessibility

```tsx
test('button is accessible', () => {
  render(<Button disabled>Submit</Button>);

  const button = screen.getByRole('button', { name: /submit/i });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-disabled', 'true');
});
```

## Mocking API Calls (MSW)

```tsx
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/user', () => HttpResponse.json({ name: 'John' }))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays user data', async () => {
  render(<UserProfile />);
  expect(await screen.findByText('John')).toBeInTheDocument();
});
```

## Custom Render with Providers

```tsx
// test-utils.tsx
function customRender(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider><QueryClientProvider>{children}</QueryClientProvider></ThemeProvider>
    ),
    ...options,
  });
}

export { customRender as render };
```
