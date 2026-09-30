import type { ReactNode } from 'react';
import { cn } from '../../utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover = false, glow = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden',
        hover && 'transition-all duration-300 hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border)] hover:scale-[1.02] cursor-pointer',
        glow && 'glow-subtle',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }} : undefined}
    >
      {children}
    </div>
  );
}
