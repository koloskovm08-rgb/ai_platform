import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Skeleton className="h-10 w-64 mb-8" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="border rounded-lg p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

