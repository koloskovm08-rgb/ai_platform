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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, Download, Upload, PenTool, Shapes, Type, 
  Palette, Layers, Undo, Redo, Eye, EyeOff
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { CanvasContainer } from './canvas-container';

export type LogoFormat = 'square' | 'circle' | 'horizontal' | 'vertical';
export type LogoSize = 'small' | 'medium' | 'large' | 'custom';

const LOGO_SIZES = {
  small: { width: 200, height: 200 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 },
  custom: { width: 400, height: 400 },
};

export function LogoEditor() {
  const toast = useToast();
  
  const [logoFormat, setLogoFormat] = React.useState<LogoFormat>('square');
  const [logoSize, setLogoSize] = React.useState<LogoSize>('medium');
  const [customWidth, setCustomWidth] = React.useState(400);
  const [customHeight, setCustomHeight] = React.useState(400);
  const [showTransparency, setShowTransparency] = React.useState(true);
  const [activeTool, setActiveTool] = React.useState<'pen' | 'shape' | 'text'>('pen');
  const [penColor, setPenColor] = React.useState('#000000');
  const [penWidth, setPenWidth] = React.useState(5);

  const size = LOGO_SIZES[logoSize];
  const width = logoSize === 'custom' ? customWidth : (logoFormat === 'horizontal' ? size.width * 2 : logoFormat === 'vertical' ? size.width / 2 : size.width);
  const height = logoSize === 'custom' ? customHeight : (logoFormat === 'horizontal' ? size.height / 2 : logoFormat === 'vertical' ? size.height * 2 : size.height);

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
    backgroundColor: showTransparency ? 'transparent' : '#ffffff',
  });

  React.useEffect(() => {
    if (!canvas) return;
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.backgroundColor = showTransparency ? 'transparent' : '#ffffff';
    canvas.renderAll();
  }, [canvas, width, height, showTransparency]);

  const handleAddShape = (shape: 'circle' | 'rect' | 'triangle') => {
    if (!canvas) return;
    let shapeObj: fabric.FabricObject;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.3;

    switch (shape) {
      case 'circle':
        shapeObj = new fabric.Circle({
          radius: size / 2,
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: penColor,
        });
        break;
      case 'rect':
        shapeObj = new fabric.Rect({
          width: size,
          height: size,
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: penColor,
        });
        break;
      case 'triangle':
        shapeObj = new fabric.Triangle({
          width: size,
          height: size,
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          fill: penColor,
        });
        break;
    }
    
    canvas.add(shapeObj);
    canvas.setActiveObject(shapeObj);
    saveHistory();
  };

  const handleAddText = () => {
    if (!canvas) return;
    const text = new fabric.IText('LOGO', {
      left: width / 2,
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 60,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: penColor,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    saveHistory();
  };

  const handleExportSVG = () => {
    if (!canvas) return;
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logo-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Логотип экспортирован в SVG');
  };

  const handleExportPNG = () => {
    if (!canvas) return;
    exportAsImage(canvas, 'png', `logo-${Date.now()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редактор логотипов</h2>
          <p className="text-sm text-muted-foreground">Создавайте векторные логотипы</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Tabs defaultValue="format" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="format">Формат</TabsTrigger>
              <TabsTrigger value="tools">Инструменты</TabsTrigger>
              <TabsTrigger value="export">Экспорт</TabsTrigger>
            </TabsList>

            <TabsContent value="format" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Формат</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Форма</Label>
                    <Select value={logoFormat} onChange={(e) => setLogoFormat(e.target.value as LogoFormat)}>
                      <option value="square">Квадрат</option>
                      <option value="circle">Круг</option>
                      <option value="horizontal">Горизонтальный</option>
                      <option value="vertical">Вертикальный</option>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Размер</Label>
                    <Select value={logoSize} onChange={(e) => setLogoSize(e.target.value as LogoSize)}>
                      <option value="small">Маленький (200x200)</option>
                      <option value="medium">Средний (400x400)</option>
                      <option value="large">Большой (800x800)</option>
                      <option value="custom">Кастомный</option>
                    </Select>
                  </div>

                  {logoSize === 'custom' && (
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

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowTransparency(!showTransparency)}
                  >
                    {showTransparency ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {showTransparency ? 'Непрозрачный фон' : 'Прозрачный фон'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Инструменты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Цвет</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={penColor}
                        onChange={(e) => setPenColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={penColor}
                        onChange={(e) => setPenColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Толщина: {penWidth}px</Label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={penWidth}
                      onChange={(e) => setPenWidth(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Фигуры</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleAddShape('circle')}>
                        <Shapes className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddShape('rect')}>
                        <Shapes className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddShape('triangle')}>
                        <Shapes className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleAddText}>
                    <Type className="mr-2 h-4 w-4" />
                    Добавить текст
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">История</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={undo} disabled={!canUndo}>
                    <Undo className="mr-2 h-4 w-4" />
                    Отменить
                  </Button>
                  <Button variant="outline" className="w-full" onClick={redo} disabled={!canRedo}>
                    <Redo className="mr-2 h-4 w-4" />
                    Повторить
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Экспорт</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="default" className="w-full" onClick={handleExportSVG}>
                    <Download className="mr-2 h-4 w-4" />
                    Экспорт SVG
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleExportPNG}>
                    <Download className="mr-2 h-4 w-4" />
                    Экспорт PNG
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-muted p-8">
        <div className="bg-white shadow-2xl">
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

