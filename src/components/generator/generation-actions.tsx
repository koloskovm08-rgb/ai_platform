'use client';

import * as React from 'react';
import { 
  Heart, 
  Share2, 
  Download, 
  Sparkles, 
  ZoomIn,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { ExportButton } from '@/components/storage/export-button';
import { Button } from '@/components/ui/button';
import { PublishButton } from '@/components/social/publish-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toaster';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { safeRemoveChild } from '@/lib/utils';

interface GenerationActionsProps {
  generationId: string;
  imageUrl: string;
  upscaledUrl?: string | null;
  isFavorite: boolean;
  isPublic: boolean;
  shareToken?: string | null;
  onFavoriteChange?: (isFavorite: boolean) => void;
  onShareChange?: (shareUrl: string | null) => void;
  onVariationsCreated?: () => void;
  onUpscaled?: () => void;
}

export function GenerationActions({
  generationId,
  imageUrl,
  upscaledUrl,
  isFavorite,
  isPublic,
  shareToken,
  onFavoriteChange,
  onShareChange,
  onVariationsCreated,
  onUpscaled,
}: GenerationActionsProps) {
  const toast = useToast();
  const [isFavoriteLoading, setIsFavoriteLoading] = React.useState(false);
  const [isShareLoading, setIsShareLoading] = React.useState(false);
  const [isVariationsLoading, setIsVariationsLoading] = React.useState(false);
  const [isUpscaleLoading, setIsUpscaleLoading] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState<string | null>(
    shareToken ? `${window.location.origin}/share/${shareToken}` : null
  );
  const [copied, setCopied] = React.useState(false);
  const [upscaleScale, setUpscaleScale] = React.useState<'2' | '4'>('2');
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isUpscaleDialogOpen, setIsUpscaleDialogOpen] = React.useState(false);

  const handleFavorite = async () => {
    setIsFavoriteLoading(true);
    try {
      const response = await fetch(`/api/generate/${generationId}/favorite`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении избранного');
      }

      const data = await response.json();
      onFavoriteChange?.(data.isFavorite);
      toast.success(data.message);
    } catch {
      toast.error('Не удалось обновить избранное');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    setIsShareLoading(true);
    try {
      const response = await fetch(`/api/generate/${generationId}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при настройке шаринга');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
      onShareChange?.(data.shareUrl);
      toast.success(data.message);
    } catch {
      toast.error('Не удалось настроить шаринг');
    } finally {
      setIsShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Ссылка скопирована');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVariations = async () => {
    setIsVariationsLoading(true);
    try {
      const response = await fetch('/api/generate/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId,
          numOutputs: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка генерации вариаций');
      }

      toast.success('Вариации создаются...');
      onVariationsCreated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка генерации вариаций');
    } finally {
      setIsVariationsLoading(false);
    }
  };

  const handleUpscale = async () => {
    setIsUpscaleLoading(true);
    try {
      const response = await fetch('/api/generate/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId,
          scale: upscaleScale,
          faceEnhance: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка увеличения разрешения');
      }

      toast.success('Увеличение разрешения началось...');
      onUpscaled?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка увеличения разрешения');
    } finally {
      setIsUpscaleLoading(false);
    }
  };

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

  return (
    <div className="flex items-center gap-2">
      {/* Избранное */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavorite}
        disabled={isFavoriteLoading}
        className={isFavorite ? 'text-red-500 hover:text-red-600' : ''}
        aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      >
        {isFavoriteLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        )}
      </Button>

      {/* Поделиться */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isShareLoading}
            aria-label="Поделиться"
          >
            {isShareLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className={`h-4 w-4 ${isPublic ? 'text-primary' : ''}`} />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Поделиться изображением</DialogTitle>
            <DialogDescription>
              Создайте публичную ссылку для шаринга изображения
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={handleShare}
              disabled={isShareLoading}
              className="w-full"
            >
              {isShareLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : isPublic ? (
                'Выключить публичный доступ'
              ) : (
                'Включить публичный доступ'
              )}
            </Button>

            {shareUrl && (
              <div className="space-y-2">
                <Label>Публичная ссылка</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Вариации */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleVariations}
        disabled={isVariationsLoading}
        aria-label="Создать вариации"
      >
        {isVariationsLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </Button>

      {/* Upscale */}
      {!upscaledUrl && (
        <Dialog open={isUpscaleDialogOpen} onOpenChange={setIsUpscaleDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isUpscaleLoading}
              aria-label="Увеличить разрешение"
            >
              {isUpscaleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ZoomIn className="h-4 w-4" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Увеличить разрешение</DialogTitle>
              <DialogDescription>
                Увеличьте разрешение изображения в 2x или 4x раза
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Масштаб увеличения</Label>
                <Select
                  value={upscaleScale}
                  onChange={(e) => setUpscaleScale(e.target.value as '2' | '4')}
                >
                  <option value="2">2x (удвоить)</option>
                  <option value="4">4x (увеличить в 4 раза)</option>
                </Select>
              </div>
              <Button
                onClick={handleUpscale}
                disabled={isUpscaleLoading}
                className="w-full"
              >
                {isUpscaleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <ZoomIn className="mr-2 h-4 w-4" />
                    Увеличить разрешение
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Скачать */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => downloadImage(upscaledUrl || imageUrl, `${generationId}.png`)}
        aria-label="Скачать"
      >
        <Download className="h-4 w-4" />
      </Button>

      {/* Сохранить в хранилище */}
      <ExportButton
        imageUrl={upscaledUrl || imageUrl}
        imageName={`generation-${generationId}`}
        variant="ghost"
        size="sm"
      />

      {/* Публикация в соцсети */}
      <PublishButton
        contentType="GENERATION"
        contentId={generationId}
        imageUrl={upscaledUrl || imageUrl}
      />
    </div>
  );
}

