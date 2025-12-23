'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Динамический импорт редактора для code splitting
// Fabric.js загружается только когда редактор действительно нужен
const ImageEditor = dynamic(
  () => import('@/components/editor/image-editor').then((mod) => ({ default: mod.ImageEditor })),
  {
    ssr: false, // Fabric.js не работает на сервере
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора...</p>
        </div>
      </div>
    ),
  }
);

export default function EditPage() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('image');
  
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    imageUrl || undefined
  );
  const [showUpload, setShowUpload] = React.useState(!imageUrl);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setSelectedImage(imageUrl);
      setShowUpload(false);
    };
    reader.readAsDataURL(file);
  };

  if (showUpload) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Редактор изображений</h1>
            <p className="text-muted-foreground">
              Загрузите изображение, чтобы начать редактирование
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Выбрать изображение
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="mt-8 rounded-lg border bg-muted/50 p-4 text-left">
            <h3 className="mb-2 font-semibold">Возможности редактора:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✏️ Добавление текста и фигур</li>
              <li>🎨 Фильтры и эффекты</li>
              <li>🔄 Поворот и отражение</li>
              <li>⬅️ Отмена и возврат действий</li>
              <li>💾 Экспорт в PNG, JPEG, SVG</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <ImageEditor initialImageUrl={selectedImage} width={800} height={600} />
    </div>
  );
}

