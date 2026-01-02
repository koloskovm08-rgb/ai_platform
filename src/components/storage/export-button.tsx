'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadImage, type UploadResult } from '@/lib/storage/upload';

interface ExportButtonProps {
  imageUrl: string;
  imageName?: string;
  onSuccess?: (url: string, filename: string) => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

/**
 * Кнопка экспорта изображения в локальное хранилище
 * Показывает статус загрузки и результат
 */
export function ExportButton({
  imageUrl,
  imageName = 'exported-image',
  onSuccess,
  onError,
  variant = 'outline',
  size = 'sm',
  className,
}: ExportButtonProps) {
  const [status, setStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedUrl, setUploadedUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleExport = async () => {
    try {
      setStatus('uploading');
      setError(null);

      const result: UploadResult = await uploadImage(imageUrl, {
        folder: 'exports',
        filename: `${imageName}.png`,
      });

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Ошибка загрузки');
      }

      setUploadedUrl(result.url);
      setStatus('success');
      onSuccess?.(result.url, result.filename || '');

      // Автоматически сбросить статус через 3 секунды
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Не удалось загрузить изображение';
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
            <Save className="mr-2 h-4 w-4" />
            Сохранить
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
            Сохранено!
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
          Открыть изображение
        </a>
      )}
      {error && status === 'error' && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

