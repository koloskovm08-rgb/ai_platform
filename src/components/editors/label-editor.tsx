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
import { Textarea } from '@/components/ui/textarea';
import { 
  Tag, Barcode, Download, Type, Image as ImageIcon,
  Package, FileText, Hash
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { CanvasContainer } from './canvas-container';

export type LabelSize = 'small' | 'medium' | 'large' | 'custom';

const LABEL_SIZES = {
  small: { width: 50, height: 30, label: 'Маленькая (50x30 мм)' },
  medium: { width: 100, height: 60, label: 'Средняя (100x60 мм)' },
  large: { width: 150, height: 100, label: 'Большая (150x100 мм)' },
  custom: { width: 100, height: 60, label: 'Кастомная' },
};

const mmToPx = (mm: number, dpi: number = 300) => {
  return Math.round((mm / 25.4) * dpi);
};

export function LabelEditor() {
  const toast = useToast();
  
  const [labelSize, setLabelSize] = React.useState<LabelSize>('medium');
  const [customWidth, setCustomWidth] = React.useState(100);
  const [customHeight, setCustomHeight] = React.useState(60);
  const [productName, setProductName] = React.useState('Название товара');
  const [productCode, setProductCode] = React.useState('SKU-12345');
  const [barcode, setBarcode] = React.useState('1234567890123');
  const [price, setPrice] = React.useState('999 ₽');
  const [description, setDescription] = React.useState('Описание товара');

  const size = LABEL_SIZES[labelSize];
  const width = mmToPx(size.width);
  const height = mmToPx(size.height);

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

  const handleApplyTemplate = () => {
    if (!canvas) return;
    
    // Очищаем canvas
    const objects = canvas.getObjects();
    objects.forEach(obj => canvas.remove(obj));

    // Рамка
    const border = new fabric.Rect({
      width: width - 4,
      height: height - 4,
      left: 2,
      top: 2,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    canvas.add(border);
    canvas.sendObjectToBack(border);

    // Название товара
    if (productName) {
      const nameText = new fabric.IText(productName, {
        left: 5,
        top: 5,
        originX: 'left',
        originY: 'top',
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#000000',
        width: width - 10,
      });
      canvas.add(nameText);
    }

    // Код товара
    if (productCode) {
      const codeText = new fabric.IText(`Код: ${productCode}`, {
        left: 5,
        top: height - 45,
        originX: 'left',
        originY: 'top',
        fontSize: 10,
        fontFamily: 'Arial',
        fill: '#666666',
      });
      canvas.add(codeText);
    }

    // Цена
    if (price) {
      const priceText = new fabric.IText(price, {
        left: width - 5,
        top: 5,
        originX: 'right',
        originY: 'top',
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#dc2626',
      });
      canvas.add(priceText);
    }

    // Штрих-код (упрощенный)
    if (barcode) {
      const barcodeY = height - 20;
      const barWidth = (width - 10) / barcode.length;
      barcode.split('').forEach((char, index) => {
        if (char !== ' ') {
          const bar = new fabric.Rect({
            width: barWidth * 0.8,
            height: 15,
            left: 5 + index * barWidth,
            top: barcodeY,
            fill: '#000000',
            selectable: false,
            evented: false,
          });
          canvas.add(bar);
        }
      });
      
      // Текст под штрих-кодом
      const barcodeText = new fabric.IText(barcode, {
        left: width / 2,
        top: barcodeY + 15,
        originX: 'center',
        originY: 'top',
        fontSize: 8,
        fontFamily: 'Arial',
        fill: '#000000',
      });
      canvas.add(barcodeText);
    }

    canvas.renderAll();
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
            const scale = Math.min((width * 0.4) / (img.width || 1), (height * 0.5) / (img.height || 1));
            img.scale(scale);
            img.set({
              left: width - 10,
              top: 30,
              originX: 'right',
              originY: 'top',
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
    exportAsImage(canvas, 'png', `label-${Date.now()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редактор этикеток</h2>
          <p className="text-sm text-muted-foreground">Создавайте этикетки для товаров</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Размер</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={labelSize} onChange={(e) => setLabelSize(e.target.value as LabelSize)}>
                <option value="small">Маленькая (50x30 мм)</option>
                <option value="medium">Средняя (100x60 мм)</option>
                <option value="large">Большая (150x100 мм)</option>
                <option value="custom">Кастомная</option>
              </Select>
              {labelSize === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Ширина (мм)</Label>
                    <Input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Высота (мм)</Label>
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
              <CardTitle className="text-sm">Информация о товаре</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Название товара"
                />
              </div>
              <div className="space-y-2">
                <Label>Код товара</Label>
                <Input
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="SKU-12345"
                />
              </div>
              <div className="space-y-2">
                <Label>Штрих-код</Label>
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="1234567890123"
                />
              </div>
              <div className="space-y-2">
                <Label>Цена</Label>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="999 ₽"
                />
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Описание"
                  rows={2}
                />
              </div>
              <Button variant="default" className="w-full" onClick={handleApplyTemplate}>
                <FileText className="mr-2 h-4 w-4" />
                Применить шаблон
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Инструменты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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

