'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FiltersPanelProps {
  onApplyFilter: (filterType: string, value?: number) => void;
  onClearFilters: () => void;
  className?: string;
}

const filters = [
  { id: 'grayscale', name: 'Ч/Б', emoji: '⚫' },
  { id: 'sepia', name: 'Сепия', emoji: '🟤' },
  { id: 'invert', name: 'Инверсия', emoji: '🔄' },
];

export function FiltersPanel({
  onApplyFilter,
  onClearFilters,
  className,
}: FiltersPanelProps) {
  const [brightness, setBrightness] = React.useState(0);
  const [contrast, setContrast] = React.useState(0);
  const [blur, setBlur] = React.useState(0);

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-6">
        <div>
          <Label className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Фильтры
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant="outline"
                size="sm"
                onClick={() => onApplyFilter(filter.id)}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <span className="text-xl">{filter.emoji}</span>
                <span className="text-xs">{filter.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="brightness" className="text-sm">
                Яркость
              </Label>
              <span className="text-xs text-muted-foreground">{brightness}</span>
            </div>
            <input
              id="brightness"
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={brightness}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setBrightness(value);
                onApplyFilter('brightness', value);
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="contrast" className="text-sm">
                Контраст
              </Label>
              <span className="text-xs text-muted-foreground">{contrast}</span>
            </div>
            <input
              id="contrast"
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={contrast}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setContrast(value);
                onApplyFilter('contrast', value);
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="blur" className="text-sm">
                Размытие
              </Label>
              <span className="text-xs text-muted-foreground">{blur}</span>
            </div>
            <input
              id="blur"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={blur}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setBlur(value);
                onApplyFilter('blur', value);
              }}
              className="w-full"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setBrightness(0);
            setContrast(0);
            setBlur(0);
            onClearFilters();
          }}
        >
          Сбросить фильтры
        </Button>
      </div>
    </Card>
  );
}

