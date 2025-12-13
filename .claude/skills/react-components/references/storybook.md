# Storybook Setup

## Installation

```bash
npx storybook@latest init
```

## Story Format (CSF3)

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Button', variant: 'primary' },
};

export const Loading: Story = {
  args: { children: 'Loading', isLoading: true },
};

export const WithIcons: Story = {
  args: {
    children: 'Download',
    leftIcon: <DownloadIcon />,
  },
};
```

## Decorators (Context Providers)

```tsx
// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/theme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};
export default preview;
```

## Accessibility Addon

```bash
npm i -D @storybook/addon-a11y
```

```ts
// .storybook/main.ts
addons: ['@storybook/addon-a11y']
```

## Interaction Testing

```tsx
import { within, userEvent, expect } from '@storybook/test';

export const Clickable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByText('Clicked')).toBeInTheDocument();
  },
};
```
