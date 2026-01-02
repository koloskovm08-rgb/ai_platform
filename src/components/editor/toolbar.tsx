'use client';

import * as React from 'react';
import {
  Type,
  Square,
  Circle,
  Triangle,
  Image as ImageIcon,
  Trash2,
  RotateCw,
  FlipHorizontal,
  Undo,
  Redo,
  Download,
  Crop,
  Paintbrush,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onAddTriangle: () => void;
  onAddRectangleGradient?: () => void;
  onAddCircleGradient?: () => void;
  onLoadImage: () => void;
  onEnableCrop?: () => void;
  onToggleDrawing?: (enabled: boolean) => void;
  onBrushColorChange?: (color: string) => void;
  onBrushWidthChange?: (width: number) => void;
  onDelete: () => void;
  onRotate: () => void;
  onFlip: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: (format: 'png' | 'jpeg' | 'svg') => void;
  canUndo: boolean;
  canRedo: boolean;
  isDrawingMode?: boolean;
  className?: string;
}

export function Toolbar({
  onAddText,
  onAddRectangle,
  onAddCircle,
  onAddTriangle,
  onAddRectangleGradient,
  onAddCircleGradient,
  onLoadImage,
  onEnableCrop,
  onToggleDrawing,
  onBrushColorChange,
  onBrushWidthChange,
  onDelete,
  onRotate,
  onFlip,
  onUndo,
  onRedo,
  onExport,
  canUndo,
  canRedo,
  isDrawingMode = false,
  className,
}: ToolbarProps) {
  const [exportFormat, setExportFormat] = React.useState<'png' | 'jpeg' | 'svg'>('png');
  const [brushColor, setBrushColor] = React.useState('#000000');
  const [brushWidth, setBrushWidth] = React.useState(5);

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-6">
        {/* История */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            История
          </Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex-1"
            >
              <Undo className="mr-2 h-4 w-4" />
              Отменить
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex-1"
            >
              <Redo className="mr-2 h-4 w-4" />
              Вернуть
            </Button>
          </div>
        </div>

        {/* Инструменты */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Инструменты
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={onAddText}>
              <Type className="mr-2 h-4 w-4" />
              Текст
            </Button>
            <Button variant="outline" size="sm" onClick={onLoadImage}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Картинка
            </Button>
          </div>
        </div>

        {/* Фигуры */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Фигуры
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onAddRectangle}
              title="Прямоугольник"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onAddCircle}
              title="Круг"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onAddTriangle}
              title="Треугольник"
            >
              <Triangle className="h-4 w-4" />
            </Button>
          </div>
          {/* Фигуры с градиентом */}
          {(onAddRectangleGradient || onAddCircleGradient) && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {onAddRectangleGradient && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddRectangleGradient}
                  title="Прямоугольник с градиентом"
                >
                  <Palette className="mr-1 h-3 w-3" />
                  Градиент
                </Button>
              )}
              {onAddCircleGradient && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddCircleGradient}
                  title="Круг с градиентом"
                >
                  <Palette className="mr-1 h-3 w-3" />
                  Радиал
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Новые инструменты: Обрезка и Кисть */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Новые инструменты
          </Label>
          <div className="space-y-2">
            {onEnableCrop && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onEnableCrop}
              >
                <Crop className="mr-2 h-4 w-4" />
                Обрезать
              </Button>
            )}
            {onToggleDrawing && (
              <>
                <Button
                  variant={isDrawingMode ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => onToggleDrawing(!isDrawingMode)}
                >
                  <Paintbrush className="mr-2 h-4 w-4" />
                  {isDrawingMode ? 'Кисть: ВКЛ' : 'Кисть'}
                </Button>
                {isDrawingMode && (
                  <div className="space-y-2 pl-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Цвет</Label>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => {
                          setBrushColor(e.target.value);
                          onBrushColorChange?.(e.target.value);
                        }}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Размер: {brushWidth}px</Label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={brushWidth}
                        onChange={(e) => {
                          const width = parseInt(e.target.value);
                          setBrushWidth(width);
                          onBrushWidthChange?.(width);
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Трансформации */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Трансформации
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={onRotate}>
              <RotateCw className="mr-2 h-4 w-4" />
              Повернуть
            </Button>
            <Button variant="outline" size="sm" onClick={onFlip}>
              <FlipHorizontal className="mr-2 h-4 w-4" />
              Отразить
            </Button>
          </div>
        </div>

        {/* Действия */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Действия
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить выбранное
          </Button>
        </div>

        {/* Экспорт */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Экспорт
          </Label>
          <Select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpeg' | 'svg')}
            className="mb-2"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="svg">SVG</option>
          </Select>
          <Button
            size="sm"
            className="w-full"
            onClick={() => onExport(exportFormat)}
          >
            <Download className="mr-2 h-4 w-4" />
            Скачать {exportFormat.toUpperCase()}
          </Button>
        </div>
      </div>
    </Card>
  );
}

