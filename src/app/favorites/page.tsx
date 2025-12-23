'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GenerationCardSkeleton } from '@/components/ui/skeleton';
import { GenerationActions } from '@/components/generator/generation-actions';

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

export default function FavoritesPage() {
  const [generations, setGenerations] = React.useState<Generation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/generate?favorites=true');
      if (response.ok) {
        const data = await response.json();
        setGenerations(data.generations || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteChange = (generationId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      // Удалить из списка, если убрали из избранного
      setGenerations((prev) => prev.filter((g) => g.id !== generationId));
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/generate">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к генерации
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold">Избранное</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Ваши любимые сгенерированные изображения
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GenerationCardSkeleton key={i} />
          ))}
        </div>
      ) : generations.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                Пока нет избранных изображений
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Добавьте изображения в избранное, чтобы быстро находить их
              </p>
              <Button asChild>
                <Link href="/generate">Перейти к генерации</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {generations.map((gen) => (
            <Card key={gen.id} className="group overflow-hidden">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={gen.upscaledUrl || gen.imageUrl}
                  alt={gen.prompt}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading="lazy"
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
                      onFavoriteChange={(isFavorite) => 
                        handleFavoriteChange(gen.id, isFavorite)
                      }
                    />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {gen.model === 'DALL_E_3' ? 'DALL-E 3' : 'Stable Diffusion'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(gen.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
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
    </div>
  );
}

