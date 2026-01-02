'use client';

import * as React from 'react';
import * as fabric from 'fabric';
import type { FabricObject } from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { 
  Download, 
  Undo, 
  Redo, 
  Type, 
  Circle, 
  Square, 
  Star,
  Heart,
  Hexagon
} from 'lucide-react';
import { exportAsImage, addText } from '@/lib/utils/image-editor';

export type BadgeShape = 'circle' | 'square' | 'star' | 'heart' | 'hexagon';

const SIZE_PRESETS = [
  { label: '64x64', value: 64 },
  { label: '128x128', value: 128 },
  { label: '256x256', value: 256 },
  { label: '512x512', value: 512 },
  { label: '1024x1024', value: 1024 },
];

const SHAPE_ICONS = {
  circle: Circle,
  square: Square,
  star: Star,
  heart: Heart,
  hexagon: Hexagon,
};

export function BadgeEditor() {
  const [size, setSize] = React.useState(256);
  const [shape, setShape] = React.useState<BadgeShape>('circle');
  const [backgroundColor, setBackgroundColor] = React.useState('#3b82f6');

  const {
    canvasRef,
    canvas,
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFabricCanvas({ 
    width: size, 
    height: size, 
    backgroundColor: 'transparent' 
  });

  // Обновление размера canvas при изменении размера
  React.useEffect(() => {
    if (!canvas) return;
    
    canvas.setWidth(size);
    canvas.setHeight(size);
    canvas.renderAll();
  }, [canvas, size]);

  // Создание фона с формой значка
  const backgroundRef = React.useRef<FabricObject | null>(null);

  React.useEffect(() => {
    if (!canvas) return;

    // Удаляем старый фон
    if (backgroundRef.current) {
      canvas.remove(backgroundRef.current);
    }

    let shapeObject: FabricObject;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 2; // Небольшой отступ от края

    switch (shape) {
      case 'circle':
        shapeObject = new fabric.Circle({
          radius,
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: 'transparent',
          selectable: false,
          evented: false,
        });
        break;
      case 'square':
        shapeObject = new fabric.Rect({
          width: size - 4,
          height: size - 4,
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: 'transparent',
          selectable: false,
          evented: false,
        });
        break;
      case 'star':
        const starPoints: { x: number; y: number }[] = [];
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.5;
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / spikes - Math.PI / 2;
          starPoints.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          });
        }
        shapeObject = new fabric.Polygon(starPoints, {
          fill: 'transparent',
          selectable: false,
          evented: false,
        });
        break;
      case 'heart':
        // Приближенная форма сердца через Path
        const heartPath = `M ${centerX},${centerY + radius * 0.3} 
          C ${centerX},${centerY} ${centerX - radius * 0.5},${centerY - radius * 0.3} ${centerX - radius * 0.5},${centerY}
          C ${centerX - radius * 0.5},${centerY + radius * 0.2} ${centerX},${centerY + radius * 0.6} ${centerX},${centerY + radius * 0.9}
          C ${centerX},${centerY + radius * 0.6} ${centerX + radius * 0.5},${centerY + radius * 0.2} ${centerX + radius * 0.5},${centerY}
          C ${centerX + radius * 0.5},${centerY - radius * 0.3} ${centerX},${centerY} ${centerX},${centerY + radius * 0.3} Z`;
        shapeObject = new fabric.Path(heartPath, {
          fill: 'transparent',
          selectable: false,
          evented: false,
        });
        break;
      case 'hexagon':
        const hexPoints: { x: number; y: number }[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * i) / 3 - Math.PI / 2;
          hexPoints.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          });
        }
        shapeObject = new fabric.Polygon(hexPoints, {
          fill: 'transparent',
          selectable: false,
          evented: false,
        });
        break;
      default:
        shapeObject = new fabric.Circle({
          radius,
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: 'transparent',
          selectable: false,
          evented: false,
        });
    }

    // Устанавливаем fill для формы
    shapeObject.set({
      fill: backgroundColor,
    });

    canvas.add(shapeObject);
    canvas.sendObjectToBack(shapeObject);
    backgroundRef.current = shapeObject;
    
    canvas.renderAll();
  }, [canvas, shape, size, backgroundColor]);

  const handleAddText = () => {
    if (!canvas) return;
    addText(canvas, 'Текст');
    saveHistory();
  };

  const handleExport = (format: 'png' | 'svg') => {
    if (!canvas) return;
    exportAsImage(canvas, format, `badge-${shape}-${size}px`);
  };

  // Экспорт с обрезкой по форме (используем clipPath на canvas)
  const handleExportWithClip = async () => {
    if (!canvas) return;
    
    // Создаем временный canvas для экспорта
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Экспортируем основной canvas
    const dataURL = canvas.toDataURL({
      format: 'png',
      multiplier: 1,
      enableRetinaScaling: false,
    });

    const img = new Image();
    img.onload = () => {
      // Применяем маску формы
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - 2;

      if (shape === 'circle') {
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      } else if (shape === 'square') {
        ctx.rect(2, 2, size - 4, size - 4);
      } else if (shape === 'star') {
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.5;
        ctx.moveTo(centerX, centerY - outerRadius);
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / spikes - Math.PI / 2;
          ctx.lineTo(
            centerX + r * Math.cos(angle),
            centerY + r * Math.sin(angle)
          );
        }
        ctx.closePath();
      } else if (shape === 'hexagon') {
        ctx.moveTo(centerX, centerY - radius);
        for (let i = 1; i < 6; i++) {
          const angle = (Math.PI * i) / 3 - Math.PI / 2;
          ctx.lineTo(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
          );
        }
        ctx.closePath();
      } else if (shape === 'heart') {
        // Упрощенная форма сердца
        ctx.bezierCurveTo(centerX - radius * 0.5, centerY - radius * 0.3, centerX - radius * 0.5, centerY, centerX, centerY + radius * 0.3);
        ctx.bezierCurveTo(centerX + radius * 0.5, centerY, centerX + radius * 0.5, centerY - radius * 0.3, centerX, centerY - radius * 0.8);
        ctx.bezierCurveTo(centerX - radius * 0.5, centerY - radius * 0.3, centerX - radius * 0.5, centerY, centerX, centerY + radius * 0.3);
      }
      
      ctx.fill();
      ctx.restore();
      
      // Рисуем содержимое поверх маски
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0);
      
      // Сохраняем результат
      tempCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `badge-${shape}-${size}px.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = dataURL;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Панель настроек */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Форма */}
            <div className="space-y-2">
              <Label>Форма значка</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['circle', 'square', 'star', 'heart', 'hexagon'] as BadgeShape[]).map((s) => {
                  const Icon = SHAPE_ICONS[s];
                  return (
                    <Button
                      key={s}
                      variant={shape === s ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShape(s)}
                      className="h-12"
                      title={s}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Размер */}
            <div className="space-y-2">
              <Label>Размер (px)</Label>
              <div className="flex gap-2">
                <Select
                  value={size.toString()}
                  onChange={(e) => setSize(Number(e.target.value))}
                >
                  {SIZE_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                  <option value="custom">Кастомный</option>
                </Select>
                {size > 1024 && (
                  <Input
                    type="number"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    min={64}
                    max={4096}
                    className="w-24"
                  />
                )}
              </div>
            </div>

            {/* Цвет фона */}
            <div className="space-y-2">
              <Label>Цвет фона</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Инструменты */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Инструменты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleAddText}
            >
              <Type className="mr-2 h-4 w-4" />
              Добавить текст
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="flex-1"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="flex-1"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Экспорт */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Экспорт</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full"
              onClick={() => handleExportWithClip()}
            >
              <Download className="mr-2 h-4 w-4" />
              Экспорт PNG
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleExport('svg')}
            >
              <Download className="mr-2 h-4 w-4" />
              Экспорт SVG
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Canvas */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Предпросмотр</CardTitle>
            <CardDescription>
              Размер: {size}x{size}px, Форма: {shape}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center bg-muted/50 rounded-lg p-8 min-h-[600px]">
              <canvas
                ref={canvasRef}
                className="border border-border rounded shadow-lg"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

