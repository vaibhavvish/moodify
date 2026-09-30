import { cn } from '../../utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function Loader({ size = 'md', className, text }: LoaderProps) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status" aria-label="Loading">
      <div
        className={cn(
          'border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin',
          sizeMap[size]
        )}
      />
      {text && <p className="text-sm text-[var(--color-text-muted)]">{text}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function WaveformLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end gap-1 h-5', className)} aria-label="Playing">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="waveform-bar" />
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <Loader size="lg" text="Loading..." />
    </div>
  );
}
