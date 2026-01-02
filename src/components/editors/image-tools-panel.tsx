'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Image as ImageIcon,
  Crop,
  Circle,
  Square,
  Filter,
  Sparkles,
  X,
  Lock,
  Unlock,
  Replace,
} from 'lucide-react';
import type { Canvas, FabricImage, Rect } from 'fabric';
import * as fabric from 'fabric';
import { cn } from '@/lib/utils';
import {
  enableImageCrop,
  applyImageCrop,
  applyImageMask,
  removeImageMask,
  applyImageFilter,
  removeImageFilters,
  applyImageShadow,
  removeImageShadow,
  toggleImageAspectRatio,
} from '@/lib/utils/image-tools';

interface ImageToolsPanelProps {
  canvas: Canvas | null;
  onUpdate?: () => void;
  className?: string;
}

export function ImageToolsPanel({
  canvas,
  onUpdate,
  className,
}: ImageToolsPanelProps) {
  const [cropMode, setCropMode] = React.useState(false);
  const [cropRect, setCropRect] = React.useState<Rect | null>(null);
  const [hasMask, setHasMask] = React.useState(false);
  const [hasShadow, setHasShadow] = React.useState(false);
  const [aspectRatioLocked, setAspectRatioLocked] = React.useState(false);
  const [filterValue, setFilterValue] = React.useState(0);
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  // Проверяем, выбрано ли изображение
  React.useEffect(() => {
    if (!canvas) return;

    const checkSelection = () => {
      const activeObject = canvas.getActiveObject();
      const isImage = activeObject && activeObject.type === 'image';
      
      if (isImage) {
        const img = activeObject as FabricImage;
        setHasMask(!!img.clipPath);
        setHasShadow(!!img.shadow);
        setAspectRatioLocked((img.lockScalingX && img.lockScalingY) || false);
      } else {
        setHasMask(false);
        setHasShadow(false);
        setAspectRatioLocked(false);
        setCropMode(false);
        setCropRect(null);
      }
    };

    canvas.on('selection:created', checkSelection);
    canvas.on('selection:updated', checkSelection);
    canvas.on('selection:cleared', () => {
      setHasMask(false);
      setHasShadow(false);
      setAspectRatioLocked(false);
      setCropMode(false);
      setCropRect(null);
    });

    checkSelection();

    return () => {
      try {
        canvas.off('selection:created', checkSelection);
        canvas.off('selection:updated', checkSelection);
        canvas.off('selection:cleared', checkSelection);
      } catch (error) {
        console.warn('Ошибка при очистке подписок:', error);
      }
    };
  }, [canvas]);

  const handleCrop = () => {
    if (!canvas) return;
    
    if (cropMode && cropRect) {
      applyImageCrop(canvas, cropRect);
      setCropMode(false);
      setCropRect(null);
      onUpdate?.();
    } else {
      const rect = enableImageCrop(canvas);
      if (rect) {
        setCropMode(true);
        setCropRect(rect);
      }
    }
  };

  const handleCancelCrop = () => {
    if (!canvas || !cropRect) return;
    canvas.remove(cropRect);
    setCropMode(false);
    setCropRect(null);
    canvas.renderAll();
  };

  const handleMask = (type: 'circle' | 'rectangle' | 'rounded') => {
    if (!canvas) return;
    
    if (hasMask) {
      removeImageMask(canvas);
      setHasMask(false);
    } else {
      applyImageMask(canvas, type);
      setHasMask(true);
    }
    onUpdate?.();
  };

  const handleFilter = (filterType: string) => {
    if (!canvas) return;
    
    if (activeFilter === filterType) {
      removeImageFilters(canvas);
      setActiveFilter(null);
      setFilterValue(0);
    } else {
      setActiveFilter(filterType);
      applyImageFilter(
        canvas,
        filterType as any,
        filterValue
      );
    }
    onUpdate?.();
  };

  const handleFilterValueChange = (value: number[]) => {
    if (!canvas || !activeFilter) return;
    setFilterValue(value[0]);
    applyImageFilter(canvas, activeFilter as any, value[0]);
    onUpdate?.();
  };

  const handleShadow = () => {
    if (!canvas) return;
    
    if (hasShadow) {
      removeImageShadow(canvas);
      setHasShadow(false);
    } else {
      applyImageShadow(canvas);
      setHasShadow(true);
    }
    onUpdate?.();
  };

  const handleAspectRatio = () => {
    if (!canvas) return;
    const newLocked = !aspectRatioLocked;
    toggleImageAspectRatio(canvas, newLocked);
    setAspectRatioLocked(newLocked);
    onUpdate?.();
  };

  const activeObject = canvas?.getActiveObject();
  const isImageSelected = activeObject && activeObject.type === 'image';

  if (!isImageSelected) {
    return (
      <Card className={cn('opacity-50', className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Инструменты изображения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Выберите изображение для редактирования
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Инструменты изображения
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Обрезка */}
        <div className="space-y-2">
          <Label>Обрезка</Label>
          <div className="flex gap-2">
            <Button
              variant={cropMode ? 'default' : 'outline'}
              size="sm"
              onClick={handleCrop}
              className="flex-1"
            >
              <Crop className="h-4 w-4 mr-2" />
              {cropMode ? 'Применить' : 'Обрезать'}
            </Button>
            {cropMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelCrop}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Маски */}
        <div className="space-y-2">
          <Label>Маски</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={hasMask ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMask('circle')}
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={hasMask ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMask('rectangle')}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={hasMask ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMask('rounded')}
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Фильтры */}
        <div className="space-y-2">
          <Label>Фильтры</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={activeFilter === 'grayscale' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilter('grayscale')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Ч/Б
            </Button>
            <Button
              variant={activeFilter === 'sepia' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilter('sepia')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Сепия
            </Button>
            <Button
              variant={activeFilter === 'brightness' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilter('brightness')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Яркость
            </Button>
            <Button
              variant={activeFilter === 'contrast' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilter('contrast')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Контраст
            </Button>
          </div>
          {activeFilter && (activeFilter === 'brightness' || activeFilter === 'contrast') && (
            <div className="mt-2">
              <Slider
                value={[filterValue]}
                min={-100}
                max={100}
                step={1}
                onValueChange={handleFilterValueChange}
              />
            </div>
          )}
        </div>

        {/* Эффекты */}
        <div className="space-y-2">
          <Label>Эффекты</Label>
          <div className="flex gap-2">
            <Button
              variant={hasShadow ? 'default' : 'outline'}
              size="sm"
              onClick={handleShadow}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Тень
            </Button>
            <Button
              variant={aspectRatioLocked ? 'default' : 'outline'}
              size="sm"
              onClick={handleAspectRatio}
            >
              {aspectRatioLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

