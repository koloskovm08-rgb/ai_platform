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
  Megaphone, QrCode, Download, Type, Image as ImageIcon,
  Phone, Mail, MapPin, Percent, Sparkles
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { QRCodeGenerator } from './qr-code-generator';
import { CanvasContainer } from './canvas-container';

export type FlyerSize = 'a5' | 'a6' | 'custom';

const FLYER_SIZES = {
  a5: { width: 148, height: 210, label: 'A5' },
  a6: { width: 105, height: 148, label: 'A6' },
  custom: { width: 148, height: 210, label: 'Кастомный' },
};

const mmToPx = (mm: number, dpi: number = 300) => {
  return Math.round((mm / 25.4) * dpi);
};

export function FlyerEditor() {
  const toast = useToast();
  
  const [flyerSize, setFlyerSize] = React.useState<FlyerSize>('a5');
  const [customWidth, setCustomWidth] = React.useState(148);
  const [customHeight, setCustomHeight] = React.useState(210);
  const [title, setTitle] = React.useState('Специальное предложение!');
  const [description, setDescription] = React.useState('Описание акции или предложения');
  const [promoCode, setPromoCode] = React.useState('PROMO2024');
  const [discount, setDiscount] = React.useState('20%');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = React.useState(false);

  const size = FLYER_SIZES[flyerSize];
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

    // Фон с градиентом
    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: width, y2: height },
      colorStops: [
        { offset: 0, color: '#3b82f6' },
        { offset: 1, color: '#8b5cf6' },
      ],
    });
    const bg = new fabric.Rect({
      width,
      height,
      left: 0,
      top: 0,
      fill: gradient,
      selectable: false,
      evented: false,
    });
    canvas.add(bg);
    canvas.sendObjectToBack(bg);

    // Скидка
    if (discount) {
      const discountText = new fabric.IText(discount, {
        left: width / 2,
        top: 40,
        originX: 'center',
        originY: 'center',
        fontSize: 72,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      });
      canvas.add(discountText);
    }

    // Заголовок
    if (title) {
      const titleText = new fabric.IText(title, {
        left: width / 2,
        top: height / 2 - 40,
        originX: 'center',
        originY: 'center',
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      });
      canvas.add(titleText);
    }

    // Описание
    if (description) {
      const descText = new fabric.IText(description, {
        left: width / 2,
        top: height / 2 + 20,
        originX: 'center',
        originY: 'center',
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#ffffff',
        width: width - 40,
      });
      canvas.add(descText);
    }

    // Промокод
    if (promoCode) {
      const codeBg = new fabric.Rect({
        width: 200,
        height: 40,
        left: width / 2,
        top: height - 100,
        originX: 'center',
        originY: 'center',
        fill: '#ffffff',
        rx: 5,
        ry: 5,
      });
      canvas.add(codeBg);

      const codeText = new fabric.IText(promoCode, {
        left: width / 2,
        top: height - 100,
        originX: 'center',
        originY: 'center',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#3b82f6',
      });
      canvas.add(codeText);
    }

    // Контакты
    let contactY = height - 60;
    if (phone) {
      const phoneText = new fabric.IText(`📞 ${phone}`, {
        left: width / 2,
        top: contactY,
        originX: 'center',
        originY: 'center',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#ffffff',
      });
      canvas.add(phoneText);
      contactY -= 20;
    }

    if (email) {
      const emailText = new fabric.IText(`✉ ${email}`, {
        left: width / 2,
        top: contactY,
        originX: 'center',
        originY: 'center',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#ffffff',
      });
      canvas.add(emailText);
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
            const scale = Math.min((width * 0.6) / (img.width || 1), (height * 0.4) / (img.height || 1));
            img.scale(scale);
            img.set({
              left: width / 2,
              top: height / 2 - 60,
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
    exportAsImage(canvas, 'png', `flyer-${Date.now()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редактор флаеров</h2>
          <p className="text-sm text-muted-foreground">Создавайте промо-материалы</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Размер</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={flyerSize} onChange={(e) => setFlyerSize(e.target.value as FlyerSize)}>
                <option value="a5">A5</option>
                <option value="a6">A6</option>
                <option value="custom">Кастомный</option>
              </Select>
              {flyerSize === 'custom' && (
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
              <CardTitle className="text-sm">Промо-информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Заголовок</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Специальное предложение!"
                />
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Описание акции"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Скидка</Label>
                  <Input
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="20%"
                  />
                </div>
                <div>
                  <Label>Промокод</Label>
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="PROMO2024"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Контакты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон"
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Адрес"
              />
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
              <Button variant="outline" className="w-full justify-start" onClick={() => setQrCodeDialogOpen(true)}>
                <QrCode className="mr-2 h-4 w-4" />
                Добавить QR-код
              </Button>
              <Button variant="default" className="w-full" onClick={handleApplyTemplate}>
                <Sparkles className="mr-2 h-4 w-4" />
                Применить шаблон
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

      <QRCodeGenerator
        open={qrCodeDialogOpen}
        onOpenChange={setQrCodeDialogOpen}
        canvas={canvas}
        onAdd={saveHistory}
      />
    </div>
  );
}

