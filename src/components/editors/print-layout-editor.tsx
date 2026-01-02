'use client';

import * as React from 'react';
import * as fabric from 'fabric';
import type { Canvas } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal' | 'custom';

interface PrintLayoutEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceCanvas: Canvas | null;
  cardWidth: number; // в мм
  cardHeight: number; // в мм
}

const PAPER_SIZES = {
  A4: { width: 210, height: 297, label: 'A4 (210x297 мм)' },
  A3: { width: 297, height: 420, label: 'A3 (297x420 мм)' },
  Letter: { width: 215.9, height: 279.4, label: 'Letter (215.9x279.4 мм)' },
  Legal: { width: 215.9, height: 355.6, label: 'Legal (215.9x355.6 мм)' },
  custom: { width: 210, height: 297, label: 'Кастомный' },
};

// Конвертация мм в пиксели (300 DPI)
const mmToPx = (mm: number, dpi: number = 300) => {
  return Math.round((mm / 25.4) * dpi);
};


export function PrintLayoutEditor({
  open,
  onOpenChange,
  sourceCanvas,
  cardWidth,
  cardHeight,
}: PrintLayoutEditorProps) {
  const [paperSize, setPaperSize] = React.useState<PaperSize>('A4');
  const [customPaperWidth, setCustomPaperWidth] = React.useState(210);
  const [customPaperHeight, setCustomPaperHeight] = React.useState(297);
  const [margin, setMargin] = React.useState(5); // мм
  const [gap, setGap] = React.useState(2); // мм
  const [previewCanvas, setPreviewCanvas] = React.useState<Canvas | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasInstanceRef = React.useRef<Canvas | null>(null);

  const paper = PAPER_SIZES[paperSize];
  const finalPaperWidth = paperSize === 'custom' ? customPaperWidth : paper.width;
  const finalPaperHeight = paperSize === 'custom' ? customPaperHeight : paper.height;

  // Расчет размещения (мемоизирован, чтобы не пересоздавался объект)
  const layout = React.useMemo(() => {
    const availableWidth = finalPaperWidth - margin * 2;
    const availableHeight = finalPaperHeight - margin * 2;

    const cardsPerRow = Math.floor((availableWidth + gap) / (cardWidth + gap));
    const cardsPerCol = Math.floor((availableHeight + gap) / (cardHeight + gap));

    return {
      cardsPerRow: Math.max(1, cardsPerRow),
      cardsPerCol: Math.max(1, cardsPerCol),
      totalCards: Math.max(1, cardsPerRow) * Math.max(1, cardsPerCol),
    };
  }, [finalPaperWidth, finalPaperHeight, margin, gap, cardWidth, cardHeight]);

  // Создание preview canvas
  React.useEffect(() => {
    if (!previewCanvasRef.current || !sourceCanvas || !open) {
      if (previewCanvas) {
        setPreviewCanvas(null);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Используем меньший DPI для предпросмотра (72 DPI для быстрого отображения)
    // Для PDF экспорта будем использовать полный 300 DPI
    const previewDpi = 72;
    const paperWidthPx = mmToPx(finalPaperWidth, previewDpi);
    const paperHeightPx = mmToPx(finalPaperHeight, previewDpi);
    const marginPx = mmToPx(margin, previewDpi);
    const gapPx = mmToPx(gap, previewDpi);
    const cardWidthPx = mmToPx(cardWidth, previewDpi);
    const cardHeightPx = mmToPx(cardHeight, previewDpi);

    // Очищаем предыдущий canvas, если он существует
    if (canvasInstanceRef.current) {
      canvasInstanceRef.current.dispose();
      canvasInstanceRef.current = null;
    }

    const canvas = new fabric.Canvas(previewCanvasRef.current, {
      width: paperWidthPx,
      height: paperHeightPx,
      backgroundColor: '#ffffff',
    });

    canvasInstanceRef.current = canvas;

    // Получаем данные исходного canvas
    const sourceData = sourceCanvas.toDataURL({
      format: 'png',
      multiplier: 1,
    });

    // Вычисляем layout напрямую (не используем мемоизированный объект в зависимостях)
    const availableWidth = finalPaperWidth - margin * 2;
    const availableHeight = finalPaperHeight - margin * 2;
    const cardsPerRow = Math.max(1, Math.floor((availableWidth + gap) / (cardWidth + gap)));
    const cardsPerCol = Math.max(1, Math.floor((availableHeight + gap) / (cardHeight + gap)));

    // Размещаем визитки и отслеживаем загрузку
    const imagePromises: Promise<void>[] = [];
    for (let row = 0; row < cardsPerCol; row++) {
      for (let col = 0; col < cardsPerRow; col++) {
        const x = marginPx + col * (cardWidthPx + gapPx);
        const y = marginPx + row * (cardHeightPx + gapPx);

        const promise = fabric.FabricImage.fromURL(sourceData, { crossOrigin: 'anonymous' })
          .then((img) => {
            // Масштабируем изображение под размер визитки в предпросмотре
            const scaleX = cardWidthPx / (img.width || 1);
            const scaleY = cardHeightPx / (img.height || 1);
            
            img.set({
              left: x,
              top: y,
              scaleX,
              scaleY,
              selectable: false,
              evented: false,
            });
            canvas.add(img);
            canvas.renderAll();
          })
          .catch((error) => {
            console.error('Error loading image:', error);
          });
        imagePromises.push(promise);
      }
    }

    // Ждем загрузки всех изображений
    Promise.all(imagePromises)
      .then(() => {
        setIsLoading(false);
        canvas.renderAll();
        // Устанавливаем canvas в state только после загрузки всех изображений
        setPreviewCanvas(canvas);
      })
      .catch((error) => {
        console.error('Error loading images:', error);
        setIsLoading(false);
        setPreviewCanvas(null);
      });

    return () => {
      if (canvasInstanceRef.current) {
        canvasInstanceRef.current.dispose();
        canvasInstanceRef.current = null;
      }
      setPreviewCanvas(null);
      setIsLoading(false);
    };
    // Убираем layout из зависимостей, так как он вычисляется из других зависимостей
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCanvas, finalPaperWidth, finalPaperHeight, margin, gap, cardWidth, cardHeight, open]);

  // Экспорт в PDF (создаем canvas с полным разрешением 300 DPI)
  const handleExportPDF = async () => {
    if (!sourceCanvas || isLoading) {
      alert('Пожалуйста, подождите, пока изображения загрузятся');
      return;
    }

    try {
      // Создаем временный canvas с полным разрешением для PDF
      const exportDpi = 300;
      const paperWidthPx = mmToPx(finalPaperWidth, exportDpi);
      const paperHeightPx = mmToPx(finalPaperHeight, exportDpi);
      const marginPx = mmToPx(margin, exportDpi);
      const gapPx = mmToPx(gap, exportDpi);
      const cardWidthPx = mmToPx(cardWidth, exportDpi);
      const cardHeightPx = mmToPx(cardHeight, exportDpi);

      // Создаем временный canvas элемент
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = paperWidthPx;
      tempCanvas.height = paperHeightPx;

      const exportCanvas = new fabric.Canvas(tempCanvas, {
        width: paperWidthPx,
        height: paperHeightPx,
        backgroundColor: '#ffffff',
      });

      // Получаем данные исходного canvas
      const sourceData = sourceCanvas.toDataURL({
        format: 'png',
        multiplier: 1,
      });

      // Размещаем визитки на canvas для экспорта
      const imagePromises: Promise<void>[] = [];
      for (let row = 0; row < layout.cardsPerCol; row++) {
        for (let col = 0; col < layout.cardsPerRow; col++) {
          const x = marginPx + col * (cardWidthPx + gapPx);
          const y = marginPx + row * (cardHeightPx + gapPx);

          const promise = fabric.FabricImage.fromURL(sourceData, { crossOrigin: 'anonymous' })
            .then((img) => {
              const scaleX = cardWidthPx / (img.width || 1);
              const scaleY = cardHeightPx / (img.height || 1);
              
              img.set({
                left: x,
                top: y,
                scaleX,
                scaleY,
                selectable: false,
                evented: false,
              });
              exportCanvas.add(img);
            });
          imagePromises.push(promise);
        }
      }

      // Ждем загрузки всех изображений
      await Promise.all(imagePromises);
      exportCanvas.renderAll();

      // Создаем PDF
      const pdf = new jsPDF({
        orientation: finalPaperWidth > finalPaperHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [finalPaperWidth, finalPaperHeight],
      });

      const canvasDataUrl = exportCanvas.toDataURL({
        format: 'png',
        multiplier: 1.0,
      });
      pdf.addImage(canvasDataUrl, 'PNG', 0, 0, finalPaperWidth, finalPaperHeight);
      pdf.save(`business-cards-${paperSize}-${Date.now()}.pdf`);

      // Очищаем временный canvas
      exportCanvas.dispose();
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Ошибка экспорта в PDF. Убедитесь, что все изображения загружены.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Размещение на листе для печати</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Настройки */}
          <div className="w-64 space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Настройки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Формат листа</Label>
                  <Select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                  >
                    <option value="A4">A4 (210x297 мм)</option>
                    <option value="A3">A3 (297x420 мм)</option>
                    <option value="Letter">Letter (215.9x279.4 мм)</option>
                    <option value="Legal">Legal (215.9x355.6 мм)</option>
                    <option value="custom">Кастомный</option>
                  </Select>
                </div>

                {paperSize === 'custom' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Ширина (мм)</Label>
                        <Input
                          type="number"
                          value={customPaperWidth}
                          onChange={(e) => setCustomPaperWidth(Number(e.target.value))}
                          min={50}
                          max={1000}
                        />
                      </div>
                      <div>
                        <Label>Высота (мм)</Label>
                        <Input
                          type="number"
                          value={customPaperHeight}
                          onChange={(e) => setCustomPaperHeight(Number(e.target.value))}
                          min={50}
                          max={1000}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Отступы (мм)</Label>
                  <Input
                    type="number"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    min={0}
                    max={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Расстояние между визитками (мм)</Label>
                  <Input
                    type="number"
                    value={gap}
                    onChange={(e) => setGap(Number(e.target.value))}
                    min={0}
                    max={20}
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Размещение:</p>
                  <p className="text-xs text-muted-foreground">
                    {layout.cardsPerRow} × {layout.cardsPerCol} = {layout.totalCards} визиток
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Предпросмотр */}
          <div className="flex-1 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Предпросмотр</CardTitle>
                <CardDescription>
                  Размер листа: {finalPaperWidth}×{finalPaperHeight} мм
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4 min-h-[400px]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="text-sm">Загрузка предпросмотра...</p>
                    </div>
                  ) : (
                    <canvas
                      ref={previewCanvasRef}
                      className="border border-border rounded shadow-lg bg-white"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        display: previewCanvas ? 'block' : 'none',
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleExportPDF} disabled={!previewCanvas || isLoading}>
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? 'Загрузка...' : 'Экспорт PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

