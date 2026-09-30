import type { ReactNode } from 'react';
import { cn } from '../../utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

import { motion } from 'framer-motion';

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center text-center py-20 px-6', className)}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[var(--color-accent)] opacity-20 blur-xl rounded-full" />
        <div className="relative w-20 h-20 rounded-2xl glass flex items-center justify-center text-[var(--color-text-muted)] border border-white/5 shadow-xl">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 font-[var(--font-display)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-8 leading-relaxed">{description}</p>
      {action}
    </motion.div>
  );
}
