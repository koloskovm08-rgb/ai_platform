'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Check } from 'lucide-react';
import type { TextSuggestion } from '@/lib/ai/editor-assistant';
import type { Canvas, IText, FabricText } from 'fabric';

interface AITextAssistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvas: Canvas | null;
  context?: {
    purpose?: string;
    industry?: string;
    tone?: string;
  };
  onApply?: (text: string) => void;
}

export function AITextAssist({
  open,
  onOpenChange,
  canvas,
  context,
  onApply,
}: AITextAssistProps) {
  const [suggestions, setSuggestions] = React.useState<TextSuggestion | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  // Получаем текст из выбранного объекта
  const getSelectedText = React.useCallback(() => {
    if (!canvas) return '';
    const activeObject = canvas.getActiveObject();
    if (
      activeObject &&
      (activeObject.type === 'i-text' ||
        activeObject.type === 'text' ||
        activeObject.type === 'textbox')
    ) {
      return (activeObject as IText | FabricText).text || '';
    }
    return '';
  }, [canvas]);

  const fetchSuggestions = React.useCallback(async () => {
    const text = getSelectedText();
    if (!text) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/editor/ai/text-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context: context || {} }),
      });

      if (!response.ok) throw new Error('Ошибка получения предложений');

      const data = await response.json();
      setSuggestions(data.suggestions || null);
    } catch (error) {
      console.error('Error fetching text suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [getSelectedText, context]);

  React.useEffect(() => {
    if (open) {
      const text = getSelectedText();
      if (text) {
        fetchSuggestions();
      }
    }
  }, [open, fetchSuggestions, getSelectedText]);

  const handleApply = (text: string, index: number) => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (
      activeObject &&
      (activeObject.type === 'i-text' ||
        activeObject.type === 'text' ||
        activeObject.type === 'textbox')
    ) {
      (activeObject as IText | FabricText).set('text', text);
      canvas.renderAll();
      setSelectedIndex(index);
      onApply?.(text);
      setTimeout(() => {
        onOpenChange(false);
        setSelectedIndex(null);
      }, 1000);
    }
  };

  const selectedText = getSelectedText();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Помощник по тексту
          </DialogTitle>
        </DialogHeader>

        {!selectedText ? (
          <div className="text-center py-12 text-muted-foreground">
            Выберите текстовый объект для улучшения
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">AI улучшает текст...</span>
          </div>
        ) : !suggestions || suggestions.suggestions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Нет предложений.
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Оригинальный текст:</p>
              <p className="text-sm">{suggestions.original}</p>
            </div>

            {suggestions.suggestions.map((suggestion, index) => (
              <Card
                key={index}
                className={`transition-all ${
                  selectedIndex === index ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded capitalize">
                        {suggestion.style}
                      </span>
                    </div>
                    {selectedIndex === index && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm mb-2">{suggestion.text}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {suggestion.reason}
                  </p>
                  <Button
                    variant={selectedIndex === index ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => handleApply(suggestion.text, index)}
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

