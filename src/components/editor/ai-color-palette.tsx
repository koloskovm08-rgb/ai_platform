'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, Check, Palette } from 'lucide-react';
import type { ColorPalette } from '@/lib/ai/editor-assistant';
import type { Canvas } from 'fabric';

interface AIColorPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvas: Canvas | null;
  context?: {
    industry?: string;
    mood?: string;
    existingColors?: string[];
  };
  onApply?: (palette: ColorPalette) => void;
}

export function AIColorPalette({
  open,
  onOpenChange,
  context,
  onApply,
}: AIColorPaletteProps) {
  const [palettes, setPalettes] = React.useState<ColorPalette[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const fetchPalettes = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/editor/ai/color-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: context || {} }),
      });

      if (!response.ok) throw new Error('Ошибка получения палитры');

      const data = await response.json();
      setPalettes(data.palettes || []);
    } catch (error) {
      console.error('Error fetching color palettes:', error);
    } finally {
      setLoading(false);
    }
  }, [context]);

  React.useEffect(() => {
    if (open && palettes.length === 0) {
      fetchPalettes();
    }
  }, [open, fetchPalettes, palettes.length]);

  const handleApply = (palette: ColorPalette, index: number) => {
    setSelectedIndex(index);
    onApply?.(palette);
    setTimeout(() => {
      onOpenChange(false);
      setSelectedIndex(null);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            AI Цветовые палитры
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">AI подбирает цветовую палитру...</span>
          </div>
        ) : palettes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Нет предложений.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {palettes.map((palette, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedIndex === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleApply(palette, index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Палитра {index + 1}</h3>
                    {selectedIndex === index && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardDescription className="text-sm mb-4">
                    {palette.description}
                  </CardDescription>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <span className="text-xs">Primary: {palette.primary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: palette.secondary }}
                      />
                      <span className="text-xs">Secondary: {palette.secondary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: palette.accent }}
                      />
                      <span className="text-xs">Accent: {palette.accent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: palette.background }}
                      />
                      <span className="text-xs">Background: {palette.background}</span>
                    </div>
                  </div>
                  <Button
                    variant={selectedIndex === index ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    disabled={selectedIndex === index}
                  >
                    {selectedIndex === index ? 'Применено' : 'Применить'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

