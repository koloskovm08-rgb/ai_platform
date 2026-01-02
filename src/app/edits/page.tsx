'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { EditCard } from '@/components/edits/edit-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon, Wand2 } from 'lucide-react';
import Link from 'next/link';

interface Edit {
  id: string;
  originalImageUrl: string;
  editedImageUrl: string;
  thumbnailUrl: string | null;
  operations: Record<string, unknown>;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Страница истории редактирований
 * Показывает все отредактированные изображения пользователя
 */
export default function EditsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [edits, setEdits] = React.useState<Edit[]>([]);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Проверка авторизации
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/edits');
    }
  }, [status, router]);

  // Загрузка редактирований
  const fetchEdits = React.useCallback(async (page: number = 1) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const response = await fetch(`/api/edits?page=${page}&limit=12`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось загрузить историю');
      }

      if (page === 1) {
        setEdits(data.edits);
      } else {
        setEdits((prev) => [...prev, ...data.edits]);
      }
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Загружаем при монтировании
  React.useEffect(() => {
    if (session) {
      fetchEdits(1);
    }
  }, [session, fetchEdits]);

  // Загрузка следующей страницы
  const handleLoadMore = () => {
    if (pagination && pagination.hasMore && !isLoadingMore) {
      fetchEdits(pagination.page + 1);
    }
  };

  // Удаление редактирования
  const handleDelete = (id: string) => {
    setEdits((prev) => prev.filter((edit) => edit.id !== id));
    if (pagination) {
      setPagination({
        ...pagination,
        totalCount: pagination.totalCount - 1,
      });
    }
  };

  // Пока загружается
  if (status === 'loading' || (isLoading && !edits.length)) {
    return (
      <main className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
          ))}
        </div>
      </main>
    );
  }

  // Ошибка
  if (error && !edits.length) {
    return (
      <main className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-red-500/10 p-6 mb-4">
            <ImageIcon className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ошибка загрузки</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => fetchEdits(1)}>Попробовать снова</Button>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="container py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wand2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">История редактирований</h1>
            <p className="text-muted-foreground">
              {pagination
                ? `Всего редактирований: ${pagination.totalCount}`
                : 'Ваши отредактированные изображения'}
            </p>
          </div>
        </div>
      </div>

      {/* Пустое состояние */}
      {edits.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-muted p-8 mb-6">
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Нет редактирований</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Вы еще не редактировали изображения. Перейдите в редактор, чтобы
            начать создавать!
          </p>
          <Button asChild>
            <Link href="/edit">
              <Wand2 className="mr-2 h-4 w-4" />
              Открыть редактор
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Сетка редактирований */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {edits.map((edit) => (
              <EditCard key={edit.id} edit={edit} onDelete={handleDelete} />
            ))}
          </div>

          {/* Кнопка "Загрузить ещё" */}
          {pagination && pagination.hasMore && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                size="lg"
              >
                {isLoadingMore ? (
                  <>
                    <span className="mr-2">Загрузка...</span>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  `Загрузить ещё (${pagination.totalCount - edits.length} осталось)`
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

