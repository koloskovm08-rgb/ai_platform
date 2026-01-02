'use client';

import * as React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import type { Canvas, FabricImage } from 'fabric';
import * as fabric from 'fabric';
import { enhanceObjectControls, animateObjectIn } from './canvas-animations';

interface QRCodeGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvas: Canvas | null;
  onAdd: () => void;
}

export function QRCodeGenerator({ open, onOpenChange, canvas, onAdd }: QRCodeGeneratorProps) {
  const [text, setText] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Очищаем состояние при закрытии диалога
  React.useEffect(() => {
    if (!open) {
      setText('');
      setPreviewUrl(null);
      setIsGenerating(false);
    }
  }, [open]);

  // Генерируем preview QR-кода
  React.useEffect(() => {
    if (!text.trim() || !open) {
      setPreviewUrl(null);
      return;
    }

    let isCancelled = false;

    const generatePreview = async () => {
      try {
        // Используем toDataURL вместо toCanvas для избежания проблем с DOM
        const dataUrl = await QRCode.toDataURL(text, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        
        if (!isCancelled) {
          setPreviewUrl(dataUrl);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Ошибка генерации QR-кода:', error);
        }
      }
    };

    const timeoutId = setTimeout(generatePreview, 300);
    
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [text, open]);

  const handleAdd = async () => {
    if (!canvas || !text.trim()) return;

    setIsGenerating(true);
    try {
      const size = Math.min(canvas.width || 400, canvas.height || 300) * 0.2; // 20% от размера карточки
      
      // Генерируем QR-код напрямую в data URL (избегаем работы с DOM)
      const imageUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Загружаем изображение в Fabric.js
      const fabricImage = await new Promise<FabricImage>((resolve, reject) => {
        fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
          .then((img: FabricImage) => {
            resolve(img);
          })
          .catch(reject);
      });

      // Позиционируем QR-код в правом нижнем углу
      fabricImage.set({
        left: (canvas.width || 400) - (size + 20),
        top: (canvas.height || 300) - (size + 20),
        selectable: true,
        originX: 'right',
        originY: 'bottom',
      });

      enhanceObjectControls(fabricImage);
      canvas.add(fabricImage);
      canvas.setActiveObject(fabricImage);
      animateObjectIn(canvas, fabricImage);
      
      onAdd();
      onOpenChange(false);
      setText('');
      setPreviewUrl(null);
    } catch (error) {
      console.error('Ошибка добавления QR-кода:', error);
      alert('Ошибка генерации QR-кода. Попробуйте снова.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Генератор QR-кода
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="qr-text">Текст или URL</Label>
            <Input
              id="qr-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com или любой текст"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && text.trim() && !isGenerating) {
                  handleAdd();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Введите URL веб-сайта, контактную информацию или любой текст
            </p>
          </div>

          {/* Preview QR-кода */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Предпросмотр</Label>
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg border-2 border-dashed">
                <Image
                  src={previewUrl}
                  alt="QR Code Preview"
                  width={200}
                  height={200}
                  className="max-w-full h-auto"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Отмена
          </Button>
          <Button onClick={handleAdd} disabled={!text.trim() || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Добавить QR-код
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

