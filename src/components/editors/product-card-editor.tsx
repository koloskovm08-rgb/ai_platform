'use client';

import * as React from 'react';
import * as fabric from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Undo, 
  Redo, 
  Type, 
  Upload,
  Plus,
  X
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';

export type MarketplaceType = 'wildberries' | 'ozon' | 'yandex' | 'custom';

const MARKETPLACE_SIZES = {
  wildberries: { width: 1000, height: 1000, label: 'Wildberries (1000x1000)' },
  ozon: { width: 1000, height: 1000, label: 'Ozon (1000x1000)' },
  yandex: { width: 1000, height: 1000, label: 'Яндекс.Маркет (1000x1000)' },
  custom: { width: 1000, height: 1000, label: 'Кастомный' },
};

export function ProductCardEditor() {
  const [marketplace, setMarketplace] = React.useState<MarketplaceType>('wildberries');
  const [customWidth, setCustomWidth] = React.useState(1000);
  const [customHeight, setCustomHeight] = React.useState(1000);
  
  // Информация о товаре
  const [title, setTitle] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [oldPrice, setOldPrice] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [characteristics, setCharacteristics] = React.useState<Array<{key: string, value: string}>>([
    { key: '', value: '' }
  ]);

  const size = MARKETPLACE_SIZES[marketplace];
  const width = marketplace === 'custom' ? customWidth : size.width;
  const height = marketplace === 'custom' ? customHeight : size.height;

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

  // Обновление размера canvas
  React.useEffect(() => {
    if (!canvas) return;
    
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
  }, [canvas, width, height]);

  const handleAddText = (text: string, options?: { fontSize?: number; top?: number; left?: number; fontWeight?: string }) => {
    if (!canvas) return;
    
    const textObject = new fabric.IText(text, {
      left: options?.left ?? width / 2,
      top: options?.top ?? height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: options?.fontSize ?? 24,
      fontFamily: 'Arial',
      fill: '#000000',
      fontWeight: options?.fontWeight ?? 'normal',
    });
    
    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    canvas.renderAll();
    saveHistory();
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (!files.length || !canvas) return;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          
          fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
            .then((img) => {
              // Масштабируем изображение (максимум 80% от размера canvas)
              const maxWidth = width * 0.8;
              const maxHeight = height * 0.8;
              
              if (img.width && img.width > maxWidth) {
                const scale = maxWidth / img.width;
                img.scale(scale);
              }
              if (img.height && img.height > maxHeight) {
                const scale = maxHeight / img.height;
                img.scale(scale);
              }
              
              img.set({
                left: width / 2,
                top: height / 2,
                originX: 'center',
                originY: 'center',
                selectable: true,
              });
              
              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.renderAll();
              saveHistory();
            });
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  const handleApplyTemplate = () => {
    if (!canvas) return;
    
    // Очищаем canvas
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    
    // Добавляем заголовок
    if (title) {
      const titleText = new fabric.IText(title, {
        left: width / 2,
        top: height * 0.1,
        originX: 'center',
        originY: 'center',
        fontSize: 32,
        fontFamily: 'Arial',
        fill: '#000000',
        fontWeight: 'bold',
      });
      canvas.add(titleText);
    }
    
    // Добавляем цену
    if (price) {
      const priceTextStr = oldPrice ? `${price} ₽ (было ${oldPrice} ₽)` : `${price} ₽`;
      const priceText = new fabric.IText(priceTextStr, {
        left: width / 2,
        top: height * 0.2,
        originX: 'center',
        originY: 'center',
        fontSize: 28,
        fontFamily: 'Arial',
        fill: '#e74c3c',
        fontWeight: 'bold',
      });
      canvas.add(priceText);
    }
    
    // Добавляем описание
    if (description) {
      // Разбиваем описание на строки для многострочного текста
      const lines = description.split('\n');
      lines.forEach((line, index) => {
        if (line.trim()) {
          const descText = new fabric.IText(line.trim(), {
            left: width / 2,
            top: height * 0.35 + (index * 25),
            originX: 'center',
            originY: 'center',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#333333',
          });
          canvas.add(descText);
        }
      });
    }
    
    canvas.renderAll();
    saveHistory();
  };

  const handleAddCharacteristic = () => {
    setCharacteristics(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveCharacteristic = (index: number) => {
    setCharacteristics(prev => prev.filter((_, i) => i !== index));
  };

  const handleCharacteristicChange = (index: number, field: 'key' | 'value', value: string) => {
    setCharacteristics(prev => prev.map((char, i) => 
      i === index ? { ...char, [field]: value } : char
    ));
  };

  const handleExport = (format: 'png' | 'svg') => {
    if (!canvas) return;
    exportAsImage(canvas, format, `product-card-${Date.now()}`);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Панель настроек */}
      <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
        {/* Выбор маркетплейса */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Маркетплейс</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Платформа</Label>
              <Select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value as MarketplaceType)}
              >
                <option value="wildberries">Wildberries</option>
                <option value="ozon">Ozon</option>
                <option value="yandex">Яндекс.Маркет</option>
                <option value="custom">Кастомный</option>
              </Select>
            </div>

            {marketplace === 'custom' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Ширина (px)</Label>
                    <Input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      min={100}
                      max={4000}
                    />
                  </div>
                  <div>
                    <Label>Высота (px)</Label>
                    <Input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      min={100}
                      max={4000}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Размер: {width}x{height} px
            </div>
          </CardContent>
        </Card>

        {/* Информация о товаре */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Информация о товаре</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Название товара</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название товара"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Цена (₽)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="999"
                />
              </div>
              <div className="space-y-2">
                <Label>Старая цена (₽)</Label>
                <Input
                  type="number"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="1499"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание товара..."
                rows={4}
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleApplyTemplate}
            >
              Применить информацию
            </Button>
          </CardContent>
        </Card>

        {/* Характеристики */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Характеристики</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {characteristics.map((char, index) => (
              <div key={index} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={char.key}
                    onChange={(e) => handleCharacteristicChange(index, 'key', e.target.value)}
                    placeholder="Название"
                    className="flex-1"
                  />
                  <Input
                    value={char.value}
                    onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
                    placeholder="Значение"
                    className="flex-1"
                  />
                  {characteristics.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCharacteristic(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddCharacteristic}
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить характеристику
            </Button>
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
              onClick={handleAddImage}
            >
              <Upload className="mr-2 h-4 w-4" />
              Добавить изображение
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAddText('Текст')}
            >
              <Type className="mr-2 h-4 w-4" />
              Добавить текст
            </Button>
            
            <div className="flex gap-2 pt-2 border-t">
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
              onClick={() => handleExport('png')}
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
            <CardTitle>Предпросмотр карточки товара</CardTitle>
            <CardDescription>
              Размер: {width}x{height} px
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center bg-muted/50 rounded-lg p-8 min-h-[600px]">
              <div className="border border-border rounded shadow-lg bg-white inline-block" style={{ maxWidth: '100%' }}>
                <canvas
                  ref={canvasRef}
                  className="block"
                  style={{
                    maxWidth: '800px',
                    height: 'auto',
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

