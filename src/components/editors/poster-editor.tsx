'use client';

import * as React from 'react';
import * as fabric from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Save, FolderOpen, Grid, Ruler, ZoomIn, ZoomOut, 
  Maximize2, Layers, Download, Upload, Type, Image as ImageIcon
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { CanvasContainer } from './canvas-container';

export type PosterSize = 'a4' | 'a3' | 'instagram' | 'facebook' | 'banner' | 'custom';

const POSTER_SIZES = {
  a4: { width: 210, height: 297, label: 'A4 (210x297 мм)' },
  a3: { width: 297, height: 420, label: 'A3 (297x420 мм)' },
  instagram: { width: 1080, height: 1080, label: 'Instagram (1080x1080 px)' },
  facebook: { width: 1200, height: 630, label: 'Facebook (1200x630 px)' },
  banner: { width: 2000, height: 500, label: 'Баннер (2000x500 px)' },
  custom: { width: 800, height: 600, label: 'Кастомный' },
};

const mmToPx = (mm: number, dpi: number = 300) => {
  return Math.round((mm / 25.4) * dpi);
};

export function PosterEditor() {
  const { data: session } = useSession();
  const toast = useToast();
  
  const [posterSize, setPosterSize] = React.useState<PosterSize>('a4');
  const [customWidth, setCustomWidth] = React.useState(800);
  const [customHeight, setCustomHeight] = React.useState(600);
  const [zoom, setZoom] = React.useState(50);
  const [showGrid, setShowGrid] = React.useState(true);
  const [showRulers, setShowRulers] = React.useState(true);
  const [gridSize, setGridSize] = React.useState(20);
  
  const size = POSTER_SIZES[posterSize];
  const width = posterSize === 'custom' ? customWidth : (posterSize === 'instagram' || posterSize === 'facebook' || posterSize === 'banner' ? size.width : mmToPx(size.width));
  const height = posterSize === 'custom' ? customHeight : (posterSize === 'instagram' || posterSize === 'facebook' || posterSize === 'banner' ? size.height : mmToPx(size.height));

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
    backgroundColor: '#ffffff',
  });

  React.useEffect(() => {
    if (!canvas) return;
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.renderAll();
  }, [canvas, width, height]);

  const handleAddText = () => {
    if (!canvas) return;
    const text = new fabric.IText('Заголовок', {
      left: width / 2,
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 48,
      fontFamily: 'Arial',
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

  const handleExport = (format: 'png' | 'jpeg') => {
    if (!canvas) return;
    exportAsImage(canvas, format, `poster-${Date.now()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель с инструментами */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редактор постеров</h2>
          <p className="text-sm text-muted-foreground">Создавайте баннеры и постеры</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Размер */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Размер</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Формат</Label>
                <Select value={posterSize} onChange={(e) => setPosterSize(e.target.value as PosterSize)}>
                  <option value="a4">A4 (210x297 мм)</option>
                  <option value="a3">A3 (297x420 мм)</option>
                  <option value="instagram">Instagram (1080x1080)</option>
                  <option value="facebook">Facebook (1200x630)</option>
                  <option value="banner">Баннер (2000x500)</option>
                  <option value="custom">Кастомный</option>
                </Select>
              </div>
              
              {posterSize === 'custom' && (
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

          {/* Инструменты */}
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
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowGrid(!showGrid)}>
                <Grid className="mr-2 h-4 w-4" />
                {showGrid ? 'Скрыть сетку' : 'Показать сетку'}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowRulers(!showRulers)}>
                <Ruler className="mr-2 h-4 w-4" />
                {showRulers ? 'Скрыть линейки' : 'Показать линейки'}
              </Button>
            </CardContent>
          </Card>

          {/* Настройки сетки */}
          {showGrid && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Настройки сетки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Размер сетки: {gridSize}px</Label>
                  <Slider
                    value={[gridSize]}
                    onValueChange={([value]) => setGridSize(value)}
                    min={5}
                    max={50}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* История */}
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

          {/* Экспорт */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Экспорт</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="default" className="w-full" onClick={() => handleExport('png')}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт PNG
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleExport('jpeg')}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт JPG
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Основная область с canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Панель масштабирования */}
        <div className="h-12 border-b bg-background flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(10, zoom - 10))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-16 text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setZoom(100)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {width} × {height} px
          </div>
        </div>

        {/* Canvas с направляющими */}
        <div className="flex-1 overflow-auto bg-muted p-8 flex items-center justify-center">
          <div 
            className="relative bg-white shadow-lg"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center',
            }}
          >
            {/* Линейки */}
            {showRulers && (
              <>
                <div className="absolute -top-6 left-0 right-0 h-6 bg-muted border-b flex">
                  {Array.from({ length: Math.ceil(width / 50) }).map((_, i) => (
                    <div key={i} className="text-xs text-muted-foreground" style={{ width: '50px', borderLeft: '1px solid #e5e7eb' }}>
                      {i * 50}
                    </div>
                  ))}
                </div>
                <div className="absolute -left-6 top-0 bottom-0 w-6 bg-muted border-r flex flex-col">
                  {Array.from({ length: Math.ceil(height / 50) }).map((_, i) => (
                    <div key={i} className="text-xs text-muted-foreground h-[50px] border-t flex items-start justify-center">
                      {i * 50}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <CanvasContainer
              canvasRef={canvasRef}
              canvasWidth={width}
              canvasHeight={height}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

