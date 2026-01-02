'use client';

import * as React from 'react';
import { Search, X, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { templateTypes, templateCategories } from '@/lib/utils/templates';
import type { TemplateType } from '@prisma/client';
import { cn } from '@/lib/utils';

interface TemplateFiltersProps {
  selectedType: TemplateType | 'all';
  selectedCategory: string;
  searchQuery: string;
  showPremiumOnly: boolean;
  selectedTags?: string[];
  onTypeChange: (type: TemplateType | 'all') => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onPremiumToggle: (show: boolean) => void;
  onTagsChange?: (tags: string[]) => void;
  onReset: () => void;
}

// Популярные теги для быстрого поиска
const POPULAR_TAGS = [
  'бизнес',
  'социальные сети',
  'реклама',
  'презентация',
  'визитка',
  'постер',
  'логотип',
  'баннер',
];

export function TemplateFilters({
  selectedType,
  selectedCategory,
  searchQuery,
  showPremiumOnly,
  selectedTags = [],
  onTypeChange,
  onCategoryChange,
  onSearchChange,
  onPremiumToggle,
  onTagsChange,
  onReset,
}: TemplateFiltersProps) {
  const handleTagToggle = (tag: string) => {
    if (!onTagsChange) return;
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onTagsChange(newTags);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Поиск */}
        <div className="space-y-2">
          <Label htmlFor="search">Поиск</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Найти шаблон..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Теги */}
        {onTagsChange && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Теги
            </Label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      isSelected && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onTagsChange([])}
              >
                Очистить теги
              </Button>
            )}
          </div>
        )}

        {/* Тип шаблона */}
        <div className="space-y-2">
          <Label htmlFor="type">Тип шаблона</Label>
          <Select
            id="type"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as TemplateType | 'all')}
          >
            <option value="all">Все типы</option>
            {templateTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.emoji} {type.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Категория */}
        <div className="space-y-2">
          <Label htmlFor="category">Категория</Label>
          <Select
            id="category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Все категории</option>
            {templateCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Премиум фильтр */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="premium"
            checked={showPremiumOnly}
            onChange={(e) => onPremiumToggle(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="premium" className="cursor-pointer font-normal">
            Только премиум шаблоны
          </Label>
        </div>

        {/* Кнопка сброса */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onReset}
        >
          Сбросить фильтры
        </Button>
      </div>
    </Card>
  );
}

