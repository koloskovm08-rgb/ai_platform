'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadToCloudinary, type CloudinaryUploadResult } from '@/lib/cloudinary/upload';
import { isCloudinaryConfigured } from '@/lib/cloudinary/config';

interface CloudinaryExportButtonProps {
  imageUrl: string;
  imageName?: string;
  onSuccess?: (url: string, publicId: string) => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

/**
 * Кнопка экспорта изображения в Cloudinary
 * Показывает статус загрузки и результат
 */
export function CloudinaryExportButton({
  imageUrl,
  imageName = 'exported-image',
  onSuccess,
  onError,
  variant = 'outline',
  size = 'sm',
  className,
}: CloudinaryExportButtonProps) {
  const [status, setStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedUrl, setUploadedUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Проверяем конфигурацию при монтировании
  const isConfigured = isCloudinaryConfigured();

  const handleExport = async () => {
    if (!isConfigured) {
      const errorMsg = 'Cloudinary не настроен. Добавьте credentials в .env';
      setError(errorMsg);
      setStatus('error');
      onError?.(errorMsg);
      return;
    }

    try {
      setStatus('uploading');
      setError(null);

      const result: CloudinaryUploadResult = await uploadToCloudinary(imageUrl, {
        folder: 'ai-image-platform/exports',
        tags: ['export', 'ai-generated'],
        context: {
          name: imageName,
          exported_at: new Date().toISOString(),
        },
      });

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Ошибка загрузки');
      }

      setUploadedUrl(result.url);
      setStatus('success');
      onSuccess?.(result.url, result.publicId || '');

      // Автоматически сбросить статус через 3 секунды
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Не удалось загрузить в Cloudinary';
      setError(errorMsg);
      setStatus('error');
      onError?.(errorMsg);

      // Автоматически сбросить статус через 5 секунд
      setTimeout(() => {
        setStatus('idle');
        setError(null);
      }, 5000);
    }
  };

  // Если не настроен, показываем предупреждение
  if (!isConfigured) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
        title="Cloudinary не настроен"
      >
        <Cloud className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Cloudinary</span>
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={status === 'success' ? 'default' : variant}
        size={size}
        className={className}
        onClick={handleExport}
        disabled={status === 'uploading'}
      >
        {status === 'idle' && (
          <>
            <Cloud className="mr-2 h-4 w-4" />
            В Cloudinary
          </>
        )}
        {status === 'uploading' && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Загрузка...
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Загружено!
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Ошибка
          </>
        )}
      </Button>

      {/* Сообщения */}
      {uploadedUrl && status === 'success' && (
        <a
          href={uploadedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline truncate"
        >
          Открыть в Cloudinary
        </a>
      )}
      {error && status === 'error' && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

