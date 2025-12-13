import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', padding = 'md', className = '', children, ...props }, ref) => {
    const variants = {
      elevated: 'bg-white shadow-md',
      outlined: 'bg-white border border-gray-200',
      filled: 'bg-gray-50',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={`rounded-lg ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Compound components
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`} {...props}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}
