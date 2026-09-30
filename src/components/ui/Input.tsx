import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-xl',
            'border border-[var(--color-border)] px-4 py-3',
            'placeholder:text-[var(--color-text-muted)]',
            'focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30',
            'transition-all duration-200',
            icon ? 'pl-12' : undefined,
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
