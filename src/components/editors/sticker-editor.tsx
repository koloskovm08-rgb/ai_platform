'use client';

import * as React from 'react';
import * as fabric from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { useToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { 
  Sticker, Shapes, Download, Type, Image as ImageIcon,
  Circle, Square, Star, Heart, Hexagon
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { CanvasContainer } from './canvas-container';

export type StickerShape = 'circle' | 'square' | 'star' | 'heart' | 'hexagon' | 'custom';
export type StickerSize = 'small' | 'medium' | 'large' | 'custom';

const STICKER_SIZES = {
  small: { width: 100, height: 100 },
  medium: { width: 200, height: 200 },
  large: { width: 300, height: 300 },
  custom: { width: 200, height: 200 },
};

export function StickerEditor() {
  const toast = useToast();
  
  const [stickerShape, setStickerShape] = React.useState<StickerShape>('circle');
  const [stickerSize, setStickerSize] = React.useState<StickerSize>('medium');
  const [customWidth, setCustomWidth] = React.useState(200);
  const [customHeight, setCustomHeight] = React.useState(200);
  const [showCutLine, setShowCutLine] = React.useState(true);

  const size = STICKER_SIZES[stickerSize];
  const width = stickerSize === 'custom' ? customWidth : size.width;
  const height = stickerSize === 'custom' ? customHeight : size.height;

  const {
    canvasRef,
    canvas,
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFabricCanvas({ 
    width, 
    height,
    backgroundColor: 'transparent',
  });

  React.useEffect(() => {
    if (!canvas) return;
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.backgroundColor = 'transparent';
    
    // Добавляем форму вырубки
    if (showCutLine) {
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if ((obj as any).name === 'cutLine') {
          canvas.remove(obj);
        }
      });

      let cutShape: fabric.FabricObject;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 5;

      switch (stickerShape) {
        case 'circle':
          cutShape = new fabric.Circle({
            radius,
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fill: 'transparent',
            stroke: '#ff0000',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
          } as any);
          (cutShape as any).name = 'cutLine';
          break;
        case 'square':
          cutShape = new fabric.Rect({
            width: radius * 2,
            height: radius * 2,
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fill: 'transparent',
            stroke: '#ff0000',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
          } as any);
          (cutShape as any).name = 'cutLine';
          break;
        case 'star':
          const points = [];
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const r = i % 2 === 0 ? radius : radius * 0.5;
            points.push({
              x: centerX + r * Math.cos(angle - Math.PI / 2),
              y: centerY + r * Math.sin(angle - Math.PI / 2),
            });
          }
          cutShape = new fabric.Polygon(points, {
            fill: 'transparent',
            stroke: '#ff0000',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
          } as any);
          (cutShape as any).name = 'cutLine';
          break;
        case 'heart':
          // Упрощенная форма сердца
          cutShape = new fabric.Circle({
            radius: radius * 0.8,
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fill: 'transparent',
            stroke: '#ff0000',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
          } as any);
          (cutShape as any).name = 'cutLine';
          break;
        default:
          cutShape = new fabric.Circle({
            radius,
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fill: 'transparent',
            stroke: '#ff0000',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
          } as any);
          (cutShape as any).name = 'cutLine';
      }
      
      canvas.add(cutShape);
      canvas.sendObjectToBack(cutShape);
    }
    
    canvas.renderAll();
  }, [canvas, width, height, stickerShape, showCutLine]);

  const handleAddText = () => {
    if (!canvas) return;
    const text = new fabric.IText('Текст', {
      left: width / 2,
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 40,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#000000',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    saveHistory();
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !canvas) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
          .then((img) => {
            const scale = Math.min((width * 0.8) / (img.width || 1), (height * 0.8) / (img.height || 1));
            img.scale(scale);
            img.set({
              left: width / 2,
              top: height / 2,
              originX: 'center',
              originY: 'center',
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            saveHistory();
          });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleExport = () => {
    if (!canvas) return;
    exportAsImage(canvas, 'png', `sticker-${Date.now()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редактор наклеек</h2>
          <p className="text-sm text-muted-foreground">Создавайте наклейки и стикеры</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Форма</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={stickerShape} onChange={(e) => setStickerShape(e.target.value as StickerShape)}>
                <option value="circle">Круг</option>
                <option value="square">Квадрат</option>
                <option value="star">Звезда</option>
                <option value="heart">Сердце</option>
                <option value="hexagon">Шестиугольник</option>
                <option value="custom">Кастомный</option>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Размер</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={stickerSize} onChange={(e) => setStickerSize(e.target.value as StickerSize)}>
                <option value="small">Маленький (100x100)</option>
                <option value="medium">Средний (200x200)</option>
                <option value="large">Большой (300x300)</option>
                <option value="custom">Кастомный</option>
              </Select>
              {stickerSize === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Ширина</Label>
                    <Input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Высота</Label>
                    <Input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Настройки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label>Линия вырубки</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCutLine(!showCutLine)}
                >
                  {showCutLine ? 'Скрыть' : 'Показать'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Инструменты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleAddText}>
                <Type className="mr-2 h-4 w-4" />
                Добавить текст
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleAddImage}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Добавить изображение
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">История</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={undo} disabled={!canUndo}>
                Отменить
              </Button>
              <Button variant="outline" className="w-full" onClick={redo} disabled={!canRedo}>
                Повторить
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Экспорт</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт PNG
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-muted p-8 overflow-auto">
        <div className="bg-white shadow-2xl p-4">
          <CanvasContainer
            canvasRef={canvasRef}
            canvasWidth={width}
            canvasHeight={height}
            showGrid={false}
            onToggleGrid={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

