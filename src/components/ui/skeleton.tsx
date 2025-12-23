import { cn } from '@/lib/utils';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
}

export function ImageSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function TemplateCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function GenerationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

