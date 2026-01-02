'use client';

import * as React from 'react';
import Image from 'next/image';
import { Loader2, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { GenerationForm } from '@/components/generator/generation-form';
import { ProgressBar } from '@/components/generator/progress-bar';
import { GenerationActions } from '@/components/generator/generation-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GenerationCardSkeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import type { GenerateImageInput } from '@/lib/utils/validation';
import { useGenerationProgress } from '@/hooks/use-generation-progress';
import Link from 'next/link';

interface Generation {
  id: string;
  prompt: string;
  imageUrl: string;
  upscaledUrl?: string | null;
  createdAt: string;
  model: string;
  isFavorite: boolean;
  isPublic: boolean;
  shareToken?: string | null;
}

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generations, setGenerations] = React.useState<Generation[]>([]);
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);
  const [currentGenerationId, setCurrentGenerationId] = React.useState<string | null>(null);
  const itemsPerPage = 20;
  const toast = useToast();
  
  // Получаем прогресс генерации через SSE
  const generationProgress = useGenerationProgress(currentGenerationId);

  // Функция для загрузки истории генераций
  const fetchGenerations = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const favoritesParam = showFavoritesOnly ? '&favorites=true' : '';
      const response = await fetch(`/api/generate?limit=${itemsPerPage}&offset=${offset}${favoritesParam}`);
      if (response.ok) {
        const data = await response.json();
        setGenerations(data.generations);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching generations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, showFavoritesOnly, itemsPerPage]);

  // Загрузить историю генераций при монтировании и при смене страницы/фильтра
  React.useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  const handleGenerate = async (data: GenerateImageInput) => {
    setIsGenerating(true);
    setError('');
    setCurrentGenerationId(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка генерации');
      }

      // Устанавливаем ID генерации для отслеживания прогресса
      if (result.generations && result.generations.length > 0) {
        setCurrentGenerationId(result.generations[0].id);
      }

      // Добавить новые генерации в начало списка и вернуться на первую страницу
      if (result.generations) {
        // Ждём завершения генерации перед показом уведомления
        if (generationProgress.status === 'completed') {
          toast.success('Изображение успешно сгенерировано!');
        }
        setCurrentPage(1);
        await fetchGenerations(); // Перезагрузить первую страницу
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
      setError(errorMessage);
      toast.error(errorMessage);
      setCurrentGenerationId(null);
    } finally {
      // Сбрасываем генерацию только если она завершена или произошла ошибка
      if (generationProgress.status === 'completed' || generationProgress.status === 'error') {
        setIsGenerating(false);
        setCurrentGenerationId(null);
      }
    }
  };

  // Отслеживаем завершение генерации
  React.useEffect(() => {
    if (generationProgress.status === 'completed' && isGenerating) {
      setIsGenerating(false);
      toast.success('Изображение успешно сгенерировано!');
      setCurrentGenerationId(null);
      fetchGenerations();
    } else if (generationProgress.status === 'error' && isGenerating) {
      setIsGenerating(false);
      setCurrentGenerationId(null);
    }
  }, [generationProgress.status, isGenerating, toast, fetchGenerations]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Генератор изображений</h1>
        <p className="text-muted-foreground">
          Создавайте уникальные изображения с помощью искусственного интеллекта
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Форма генерации */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <GenerationForm onGenerate={handleGenerate} isLoading={isGenerating} />
          
          {/* Прогресс-бар генерации */}
          {(isGenerating || generationProgress.status !== 'idle') && (
            <div className="mt-4">
              <ProgressBar
                progress={generationProgress.progress}
                status={generationProgress.status}
                message={generationProgress.message}
              />
            </div>
          )}
          
          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Галерея результатов */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold">Результаты</h2>
              <Button
                variant={showFavoritesOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly);
                  setCurrentPage(1);
                }}
              >
                <Heart className={`mr-2 h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Только избранное
              </Button>
              {showFavoritesOnly && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/favorites">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Все избранное
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Генерация в процессе...
                </div>
              )}
              <Link href="/generate/batch">
                <Button variant="outline" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Batch генерация
                </Button>
              </Link>
            </div>
          </div>

          {isGenerating && generationProgress !== undefined && (
            <div className="mb-6">
              <ProgressBar 
                progress={generationProgress.progress}
                status={generationProgress.status}
                message={generationProgress.message}
              />
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <GenerationCardSkeleton key={i} />
              ))}
            </div>
          ) : generations.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-4xl">🎨</div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Пока нет сгенерированных изображений
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Заполните форму слева и нажмите &quot;Сгенерировать изображение&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {generations.map((gen, index) => (
                <Card key={gen.id} className="group overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={gen.imageUrl}
                      alt={gen.prompt}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading={index < 4 ? 'eager' : 'lazy'}
                      priority={index < 4}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                    />
                    
                    {/* Overlay при наведении */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-full flex-col justify-end p-4">
                        <GenerationActions
                          generationId={gen.id}
                          imageUrl={gen.imageUrl}
                          upscaledUrl={gen.upscaledUrl}
                          isFavorite={gen.isFavorite}
                          isPublic={gen.isPublic}
                          shareToken={gen.shareToken}
                          onFavoriteChange={(isFavorite) => {
                            setGenerations((prev) =>
                              prev.map((g) =>
                                g.id === gen.id ? { ...g, isFavorite } : g
                              )
                            );
                            if (showFavoritesOnly && !isFavorite) {
                              setGenerations((prev) => prev.filter((g) => g.id !== gen.id));
                            }
                          }}
                          onVariationsCreated={() => {
                            fetchGenerations();
                          }}
                          onUpscaled={() => {
                            fetchGenerations();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {gen.model === 'DALL_E_3' ? 'DALL-E 3' : 'Stable Diffusion'}
                      </span>
                      {gen.isFavorite && (
                        <Heart className="h-3 w-3 text-red-500 fill-current" />
                      )}
                      {gen.upscaledUrl && (
                        <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                          Upscaled
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(gen.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {gen.prompt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Пагинация */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Предыдущая страница"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Назад
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="min-w-[40px]"
                      aria-label={`Страница ${pageNum}`}
                      aria-current={currentPage === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Следующая страница"
              >
                Вперед
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

