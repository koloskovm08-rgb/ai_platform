'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, Check } from 'lucide-react';
import type { LayoutSuggestion } from '@/lib/ai/editor-assistant';
import type { Canvas } from 'fabric';

interface AILayoutSuggestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvas: Canvas | null;
  businessInfo?: {
    name?: string;
    position?: string;
    industry?: string;
    style?: string;
  };
  onApply?: (suggestion: LayoutSuggestion) => void;
}

export function AILayoutSuggestions({
  open,
  onOpenChange,
  businessInfo,
  onApply,
}: AILayoutSuggestionsProps) {
  const [suggestions, setSuggestions] = React.useState<LayoutSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const fetchSuggestions = React.useCallback(async () => {
    if (!businessInfo) return;

    setLoading(true);
    try {
      const response = await fetch('/api/editor/ai/layout-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessInfo }),
      });

      if (!response.ok) throw new Error('Ошибка получения предложений');

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching layout suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [businessInfo]);

  React.useEffect(() => {
    if (open && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [open, fetchSuggestions, suggestions.length]);

  const handleApply = (suggestion: LayoutSuggestion, index: number) => {
    setSelectedIndex(index);
    onApply?.(suggestion);
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
            <Sparkles className="h-5 w-5 text-primary" />
            AI Предложения по макету
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">AI анализирует и создает предложения...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Нет предложений. Проверьте информацию о бизнесе.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {suggestions.map((suggestion, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedIndex === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleApply(suggestion, index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize">{suggestion.layout}</h3>
                    {selectedIndex === index && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardDescription className="text-sm mb-4">
                    {suggestion.description}
                  </CardDescription>
                  <div className="flex gap-2 mb-4">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: suggestion.colorScheme.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: suggestion.colorScheme.secondary }}
                    />
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: suggestion.colorScheme.background }}
                    />
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

