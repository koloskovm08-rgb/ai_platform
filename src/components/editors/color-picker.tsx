'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

// Популярные цвета для быстрого выбора
const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#008000', '#000080',
];

// Локальное хранилище для истории цветов (в реальном приложении можно использовать localStorage)
const COLOR_HISTORY_KEY = 'color-picker-history';
const MAX_HISTORY = 12;

function getColorHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(COLOR_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveColorToHistory(color: string): void {
  if (typeof window === 'undefined') return;
  try {
    let history = getColorHistory();
    // Удаляем дубликаты
    history = history.filter((c) => c !== color);
    // Добавляем в начало
    history.unshift(color);
    // Ограничиваем размер
    history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Игнорируем ошибки localStorage
  }
}

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [colorHistory, setColorHistory] = React.useState<string[]>(getColorHistory());
  const [showPicker, setShowPicker] = React.useState(false);

  // Добавляем цвет в историю при изменении
  React.useEffect(() => {
    if (value) {
      saveColorToHistory(value);
      setColorHistory(getColorHistory());
    }
  }, [value]);

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
    setShowPicker(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2 items-center">
        {/* Кнопка выбора цвета */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2"
        >
          <div
            className="w-6 h-6 rounded border-2 border-gray-300"
            style={{ backgroundColor: value }}
          />
          <Palette className="h-4 w-4" />
        </Button>

        {/* Input для ввода hex-кода */}
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            const newColor = e.target.value;
            // Проверяем валидность hex-кода
            if (/^#[0-9A-Fa-f]{0,6}$/.test(newColor) || newColor === '') {
              onChange(newColor);
            }
          }}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
          maxLength={7}
        />

        {/* Input для выбора цвета (color picker) */}
        <div className="relative">
          <Input
            type="color"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-9 p-1 cursor-pointer border-0"
          />
        </div>
      </div>

      {/* Расширенная панель выбора цвета */}
      {showPicker && (
        <Card className="mt-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              Выбор цвета
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* История цветов */}
            {colorHistory.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Недавние цвета</Label>
                <div className="grid grid-cols-6 gap-2">
                  {colorHistory.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={cn(
                        'w-10 h-10 rounded border-2 transition-all hover:scale-110 hover:shadow-md',
                        value === color ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Предустановленные цвета */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Популярные цвета</Label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      'w-10 h-10 rounded border-2 transition-all hover:scale-110 hover:shadow-md',
                      value === color ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

