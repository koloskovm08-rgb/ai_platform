'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Download, FileImage, FileText, FileCode, Loader2 } from 'lucide-react';
import type { Canvas } from 'fabric';
import { exportToPNG, exportToPDF, exportToSVG, exportToEPS } from '@/lib/utils/export-tools';
import { useToast } from '@/components/ui/toaster';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvas: Canvas | null;
  cardWidth: number;
  cardHeight: number;
}

export function ExportDialog({
  open,
  onOpenChange,
  canvas,
  cardWidth,
  cardHeight,
}: ExportDialogProps) {
  const toast = useToast();
  const [format, setFormat] = React.useState<'png' | 'pdf' | 'svg' | 'eps'>('png');
  const [filename, setFilename] = React.useState(`business-card-${Date.now()}`);
  const [includeBleed, setIncludeBleed] = React.useState(true);
  const [bleedSize, setBleedSize] = React.useState(3);
  const [includeCropMarks, setIncludeCropMarks] = React.useState(true);
  const [colorMode, setColorMode] = React.useState<'RGB' | 'CMYK'>('RGB');
  const [multiplier, setMultiplier] = React.useState(2);
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    if (!canvas) {
      toast.error('Canvas не загружен');
      return;
    }

    setExporting(true);
    try {
      switch (format) {
        case 'png':
          exportToPNG(canvas, {
            filename,
            multiplier,
            quality: 1,
            includeBleed,
            bleedSize,
          });
          break;
        case 'pdf':
          exportToPDF(canvas, {
            filename,
            includeBleed,
            bleedSize,
            includeCropMarks,
            colorMode,
          });
          break;
        case 'svg':
          exportToSVG(canvas, {
            filename,
            includeBleed,
            bleedSize,
          });
          break;
        case 'eps':
          exportToEPS(canvas, {
            filename,
          });
          break;
      }
      toast.success('Экспорт завершен!');
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка экспорта');
    } finally {
      setExporting(false);
    }
  };

  const formatIcons = {
    png: FileImage,
    pdf: FileText,
    svg: FileCode,
    eps: FileCode,
  };

  const FormatIcon = formatIcons[format];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Экспорт визитки
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Формат */}
          <div className="space-y-2">
            <Label>Формат</Label>
            <div className="grid grid-cols-4 gap-2">
              {(['png', 'pdf', 'svg', 'eps'] as const).map((fmt) => {
                const Icon = formatIcons[fmt];
                return (
                  <Button
                    key={fmt}
                    variant={format === fmt ? 'default' : 'outline'}
                    onClick={() => setFormat(fmt)}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs uppercase">{fmt}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Имя файла */}
          <div className="space-y-2">
            <Label>Имя файла</Label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="business-card"
            />
          </div>

          {/* Настройки для PNG */}
          {format === 'png' && (
            <div className="space-y-2">
              <Label>Качество (multiplier): {multiplier}x</Label>
              <input
                type="range"
                min="1"
                max="4"
                step="0.5"
                value={multiplier}
                onChange={(e) => setMultiplier(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Рекомендуется 2x для печати (300 DPI)
              </p>
            </div>
          )}

          {/* Настройки для PDF */}
          {format === 'pdf' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Цветовой режим</Label>
                <Select
                  value={colorMode}
                  onChange={(e) => setColorMode(e.target.value as 'RGB' | 'CMYK')}
                >
                  <option value="RGB">RGB (для экрана)</option>
                  <option value="CMYK">CMYK (для печати)</option>
                </Select>
              </div>
            </div>
          )}

          {/* Общие настройки */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bleed"
                checked={includeBleed}
                onCheckedChange={(checked) => setIncludeBleed(checked as boolean)}
              />
              <Label htmlFor="bleed" className="cursor-pointer">
                Включить bleed (поля для обрезки)
              </Label>
            </div>

            {includeBleed && (
              <div className="ml-6 space-y-2">
                <Label>Размер bleed: {bleedSize} мм</Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={bleedSize}
                  onChange={(e) => setBleedSize(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Стандартный bleed: 3 мм
                </p>
              </div>
            )}

            {format === 'pdf' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cropmarks"
                  checked={includeCropMarks}
                  onCheckedChange={(checked) => setIncludeCropMarks(checked as boolean)}
                />
                <Label htmlFor="cropmarks" className="cursor-pointer">
                  Включить crop marks (метки обрезки)
                </Label>
              </div>
            )}
          </div>

          {/* Информация о размере */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Информация о размере:</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>Размер карточки: {cardWidth} x {cardHeight} мм</p>
              {includeBleed && (
                <p>
                  С bleed: {(cardWidth + bleedSize * 2).toFixed(1)} x {(cardHeight + bleedSize * 2).toFixed(1)} мм
                </p>
              )}
              <p>Разрешение: 300 DPI</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleExport} disabled={exporting || !canvas}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Экспорт...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Экспортировать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

