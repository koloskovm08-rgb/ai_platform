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
  Gift, FlipHorizontal, Download, Type, Image as ImageIcon,
  Heart, Sparkles, Cake, PartyPopper
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { CanvasContainer } from './canvas-container';

export type CardType = 'birthday' | 'anniversary' | 'wedding' | 'holiday' | 'custom';
export type CardSide = 'front' | 'back';

const CARD_SIZES = {
  standard: { width: 148, height: 210, label: 'Стандартная (A6)' },
  large: { width: 210, height: 297, label: 'Большая (A5)' },
};

const mmToPx = (mm: number, dpi: number = 300) => {
  return Math.round((mm / 25.4) * dpi);
};

export function GreetingCardEditor() {
  const toast = useToast();
  
  const [cardType, setCardType] = React.useState<CardType>('birthday');
  const [cardSide, setCardSide] = React.useState<CardSide>('front');
  const [recipientName, setRecipientName] = React.useState('');
  const [message, setMessage] = React.useState('С днём рождения!');
  const [senderName, setSenderName] = React.useState('');

  const size = CARD_SIZES.standard;
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

  React.useEffect(() => {
    if (!canvas) return;
    loadCardSide();
  }, [canvas, cardSide, cardType, recipientName, message, senderName]);

  const loadCardSide = () => {
    if (!canvas) return;
    
    // Очищаем canvas
    const objects = canvas.getObjects();
    objects.forEach(obj => canvas.remove(obj));

    if (cardSide === 'front') {
      // Лицевая сторона
      const gradient = new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: width, y2: height },
        colorStops: cardType === 'birthday' 
          ? [{ offset: 0, color: '#fef3c7' }, { offset: 1, color: '#fde68a' }]
          : cardType === 'wedding'
          ? [{ offset: 0, color: '#fce7f3' }, { offset: 1, color: '#fbcfe8' }]
          : [{ offset: 0, color: '#dbeafe' }, { offset: 1, color: '#bfdbfe' }],
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

      // Декоративные элементы
      if (cardType === 'birthday') {
        const emoji = new fabric.IText('🎂', {
          left: width / 2,
          top: 80,
          originX: 'center',
          originY: 'center',
          fontSize: 60,
        });
        canvas.add(emoji);
      }

      // Заголовок
      const title = new fabric.IText(message, {
        left: width / 2,
        top: height / 2 - 30,
        originX: 'center',
        originY: 'center',
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#1a1a1a',
      });
      canvas.add(title);

      // Имя получателя
      if (recipientName) {
        const name = new fabric.IText(recipientName, {
          left: width / 2,
          top: height / 2 + 30,
          originX: 'center',
          originY: 'center',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#333333',
        });
        canvas.add(name);
      }
    } else {
      // Оборотная сторона
      const bg = new fabric.Rect({
        width,
        height,
        left: 0,
        top: 0,
        fill: '#ffffff',
        selectable: false,
        evented: false,
      });
      canvas.add(bg);
      canvas.sendObjectToBack(bg);

      // Сообщение
      if (message) {
        const msg = new fabric.IText(message, {
          left: width / 2,
          top: height / 2 - 40,
          originX: 'center',
          originY: 'center',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#1a1a1a',
          width: width - 40,
        });
        canvas.add(msg);
      }

      // Подпись
      if (senderName) {
        const sender = new fabric.IText(`С любовью,\n${senderName}`, {
          left: width / 2,
          top: height - 80,
          originX: 'center',
          originY: 'center',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#333333',
        });
        canvas.add(sender);
      }
    }

    canvas.renderAll();
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
    exportAsImage(canvas, 'png', `card-${cardSide}-${Date.now()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редактор открыток</h2>
          <p className="text-sm text-muted-foreground">Создавайте поздравительные открытки</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Тип открытки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={cardType} onChange={(e) => setCardType(e.target.value as CardType)}>
                <option value="birthday">День рождения</option>
                <option value="anniversary">Юбилей</option>
                <option value="wedding">Свадьба</option>
                <option value="holiday">Праздник</option>
                <option value="custom">Кастомная</option>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={cardSide === 'front' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setCardSide('front')}
                >
                  Лицевая
                </Button>
                <Button
                  variant={cardSide === 'back' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setCardSide('back')}
                >
                  Оборотная
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Содержимое</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Имя получателя</Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Имя"
                />
              </div>
              <div className="space-y-2">
                <Label>Сообщение</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Поздравление"
                  rows={3}
                />
              </div>
              {cardSide === 'back' && (
                <div className="space-y-2">
                  <Label>От кого</Label>
                  <Input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Ваше имя"
                  />
                </div>
              )}
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

