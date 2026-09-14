import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'accent';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white active:bg-primary-hover',
  accent: 'bg-accent text-gray-900 active:bg-accent-hover',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`rounded-2xl px-6 py-6 text-xl font-medium transition-transform active:scale-95 disabled:opacity-50 ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';