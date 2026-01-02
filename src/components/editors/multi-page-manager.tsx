'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Canvas } from 'fabric';
import { cn } from '@/lib/utils';

interface Page {
  id: string;
  name: string;
  canvasData: any;
  thumbnail?: string;
}

interface MultiPageManagerProps {
  canvas: Canvas | null;
  pages: Page[];
  currentPageId: string | null;
  onPageChange: (pageId: string) => void;
  onPageAdd: () => void;
  onPageDelete: (pageId: string) => void;
  onPageDuplicate: (pageId: string) => void;
  onPageRename: (pageId: string, name: string) => void;
  className?: string;
}

export function MultiPageManager({
  canvas,
  pages,
  currentPageId,
  onPageChange,
  onPageAdd,
  onPageDelete,
  onPageDuplicate,
  onPageRename,
  className,
}: MultiPageManagerProps) {
  const currentIndex = pages.findIndex((p) => p.id === currentPageId);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < pages.length - 1;

  const handlePrev = () => {
    if (canGoPrev && pages[currentIndex - 1]) {
      onPageChange(pages[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoNext && pages[currentIndex + 1]) {
      onPageChange(pages[currentIndex + 1].id);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Страницы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Навигация по страницам */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={!canGoPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Страница {currentIndex + 1} из {pages.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Список страниц */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all',
                currentPageId === page.id
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted'
              )}
              onClick={() => onPageChange(page.id)}
            >
              {page.thumbnail && (
                <div className="w-12 h-8 rounded border overflow-hidden bg-white">
                  <img
                    src={page.thumbnail}
                    alt={page.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{page.name}</p>
                <p className="text-xs text-muted-foreground">
                  Страница {index + 1}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageDuplicate(page.id);
                  }}
                  title="Дублировать"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {pages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageDelete(page.id);
                    }}
                    title="Удалить"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Добавить страницу */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onPageAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить страницу
        </Button>
      </CardContent>
    </Card>
  );
}

