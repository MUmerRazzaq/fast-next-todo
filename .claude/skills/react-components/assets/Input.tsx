import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      size = 'md',
      leftAddon,
      rightAddon,
      className = '',
      id: providedId,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const describedBy = [
      ariaDescribedBy,
      error && errorId,
      hint && !error && hintId,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative flex">
          {leftAddon && (
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`
              block w-full border rounded-md shadow-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
              ${leftAddon ? 'rounded-l-none' : ''}
              ${rightAddon ? 'rounded-r-none' : ''}
              ${sizes[size]}
              ${className}
            `}
            {...props}
          />
          {rightAddon && (
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {rightAddon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
