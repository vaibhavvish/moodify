import { cn } from '../../utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export default function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        className
      )}
      aria-hidden="true"
    />
  );
}

// Predefined skeleton patterns
export function SongCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl">
      <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" variant="text" />
        <Skeleton className="h-3 w-1/2" variant="text" />
      </div>
      <Skeleton className="h-3 w-10" variant="text" />
    </div>
  );
}

export function MusicCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <Skeleton className="h-4 w-3/4" variant="text" />
      <Skeleton className="h-3 w-1/2" variant="text" />
    </div>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="w-32 h-32" variant="circle" />
      <Skeleton className="h-4 w-20" variant="text" />
    </div>
  );
}
