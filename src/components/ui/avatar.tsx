'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { isS3Url, getS3SignedUrlPath } from '@/lib/utils/s3-url';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: React.ReactNode;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

// Генерирует инициалы из имени
function getInitials(name?: string | null): string {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Генерирует цвет градиента на основе имени (для консистентности)
function getGradientFromName(name?: string | null): string {
  if (!name) return 'from-blue-500 to-purple-500';
  
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
    'from-pink-500 to-rose-500',
    'from-yellow-500 to-orange-500',
    'from-teal-500 to-cyan-500',
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// Нормализует URL, исправляя неправильные форматы (например, дублирование протокола)
function normalizeImageUrl(url: string): string {
  if (!url) return url;
  
  // Исправляем дублирование протокола: https://bucket.https://domain.com/path -> https://domain.com/bucket/path
  // Для VK Cloud правильный формат: https://hb.vkcs.cloud/bucket-name/path/to/file
  if (url.includes('.https://') || url.includes('.http://')) {
    // Находим позицию дублированного протокола
    const protocolIndex = url.indexOf('.https://');
    if (protocolIndex === -1) {
      const httpIndex = url.indexOf('.http://');
      if (httpIndex === -1) return url;
      // Убираем .http:// и оставляем только домен после него
      const beforeProtocol = url.substring(0, httpIndex);
      const afterProtocol = url.substring(httpIndex + 6); // +6 для '.http:'
      // Извлекаем bucket из начала (после https://)
      const bucket = beforeProtocol.replace(/^https?:\/\//, '');
      // Формируем правильный URL для VK Cloud: https://domain.com/bucket/path
      // Извлекаем путь из afterProtocol (после домена)
      const domainMatch = afterProtocol.match(/^([^\/]+)(\/.*)?$/);
      if (domainMatch) {
        const domain = domainMatch[1];
        const path = domainMatch[2] || '';
        // Формируем правильный URL: https://domain/bucket/path
        return `https://${domain}/${bucket}${path}`;
      }
      return `https://${afterProtocol}/${bucket}`;
    } else {
      // Убираем .https:// и оставляем только домен после него
      const beforeProtocol = url.substring(0, protocolIndex);
      const afterProtocol = url.substring(protocolIndex + 7); // +7 для '.https:'
      // Извлекаем bucket из начала (после https://)
      const bucket = beforeProtocol.replace(/^https?:\/\//, '');
      // Формируем правильный URL для VK Cloud: https://domain.com/bucket/path
      // Извлекаем путь из afterProtocol (после домена)
      const domainMatch = afterProtocol.match(/^([^\/]+)(\/.*)?$/);
      if (domainMatch) {
        const domain = domainMatch[1];
        const path = domainMatch[2] || '';
        // Формируем правильный URL: https://domain/bucket/path
        return `https://${domain}/${bucket}${path}`;
      }
      return `https://${afterProtocol}/${bucket}`;
    }
  }
  
  return url;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  fallback,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const initials = React.useMemo(() => getInitials(name), [name]);
  const gradient = React.useMemo(() => getGradientFromName(name), [name]);
  const sizeClass = sizeClasses[size];

  // Нормализуем URL изображения (исправляем неправильные форматы)
  const normalizedSrc = React.useMemo(() => {
    if (!src) return null;
    return normalizeImageUrl(src);
  }, [src]);

  // Состояние для signed URL (для приватных S3 bucket)
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null);
  const [isLoadingSignedUrl, setIsLoadingSignedUrl] = React.useState(false);

  // Получаем signed URL для S3 изображений (если нужно)
  React.useEffect(() => {
    if (!normalizedSrc || !mounted) return;
    
    // Если это S3 URL, получаем signed URL
    if (isS3Url(normalizedSrc) && !signedUrl && !isLoadingSignedUrl) {
      setIsLoadingSignedUrl(true);
      const signedUrlPath = getS3SignedUrlPath(normalizedSrc);
      
      if (signedUrlPath) {
        fetch(signedUrlPath)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.url) {
              setSignedUrl(data.url);
            }
          })
          .catch((err) => {
            console.error('Failed to get signed URL:', err);
            // В случае ошибки оставляем оригинальный URL
          })
          .finally(() => {
            setIsLoadingSignedUrl(false);
          });
      } else {
        setIsLoadingSignedUrl(false);
      }
    }
  }, [normalizedSrc, mounted, signedUrl, isLoadingSignedUrl]);

  // Используем signed URL если доступен, иначе оригинальный URL
  const imageSrc = signedUrl || normalizedSrc;

  // Если изображение не загрузилось или не предоставлено, показываем fallback
  const showFallback = !imageSrc || imageError || (!signedUrl && isS3Url(normalizedSrc) && isLoadingSignedUrl) || !mounted;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden bg-muted',
        sizeClass,
        className
      )}
      {...props}
    >
      {!showFallback && imageSrc ? (
        // Для signed URLs используем обычный img, так как Next.js Image не работает с signed URLs
        signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={alt || name || 'Avatar'}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <Image
            src={imageSrc}
            alt={alt || name || 'Avatar'}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes={`${size === 'sm' ? '32' : size === 'md' ? '40' : size === 'lg' ? '48' : '64'}px`}
          />
        )
      ) : (
        fallback || (
          <div
            className={cn(
              'flex items-center justify-center w-full h-full font-semibold text-white',
              `bg-gradient-to-br ${gradient}`
            )}
            aria-label={alt || name || 'Avatar'}
          >
            {initials}
          </div>
        )
      )}
    </div>
  );
}

