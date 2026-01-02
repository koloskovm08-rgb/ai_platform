import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GenerateLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Загрузка генератора...</p>
      </div>
    </div>
  );
}

