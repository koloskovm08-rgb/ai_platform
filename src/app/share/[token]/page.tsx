'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Download, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toaster';
import { safeRemoveChild } from '@/lib/utils';

interface SharedGeneration {
  id: string;
  prompt: string;
  imageUrl: string;
  upscaledUrl?: string | null;
  model: string;
  createdAt: string;
  author: string;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const toast = useToast();
  const [generation, setGeneration] = React.useState<SharedGeneration | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSharedGeneration = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/generate/share/${token}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Изображение не найдено');
      }

      const data = await response.json();
      setGeneration(data.generation);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    if (token) {
      fetchSharedGeneration();
    }
  }, [token, fetchSharedGeneration]);

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      // Используем безопасное удаление, чтобы избежать ошибок при race conditions
      safeRemoveChild(document.body, link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Изображение скачано');
    } catch {
      toast.error('Ошибка при скачивании');
    }
  };

  const shareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Загрузка изображения...</p>
        </div>
      </div>
    );
  }

  if (error || !generation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Изображение не найдено</h2>
              <p className="text-muted-foreground mb-4">{error || 'Ссылка недействительна или изображение было удалено'}</p>
              <Button asChild>
                <Link href="/">На главную</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Публичное изображение</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={shareLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Поделиться
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage(generation.upscaledUrl || generation.imageUrl, `${generation.id}.png`)}
              >
                <Download className="mr-2 h-4 w-4" />
                Скачать
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={generation.upscaledUrl || generation.imageUrl}
              alt={generation.prompt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-muted-foreground">{generation.prompt}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Модель:</span>
                <span className="ml-2 font-medium">
                  {generation.model === 'DALL_E_3' ? 'DALL-E 3' : 'Stable Diffusion'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Автор:</span>
                <span className="ml-2 font-medium">{generation.author}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Дата создания:</span>
                <span className="ml-2 font-medium">
                  {new Date(generation.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

