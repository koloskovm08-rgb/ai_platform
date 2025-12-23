'use client';

import * as React from 'react';
import { TemplateCard } from '@/components/templates/template-card';
import { TemplateFilters } from '@/components/templates/template-filters';
import { TemplatePreviewDialog } from '@/components/templates/template-preview-dialog';
import { TemplateCardSkeleton } from '@/components/ui/skeleton';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useDebounce } from '@/hooks/use-debounce';
import { useCache } from '@/hooks/use-cache';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { TemplateType } from '@prisma/client';
import { getTemplateTypeInfo, getTemplateCategoryInfo } from '@/lib/utils/templates';

interface Template {
  id: string;
  name: string;
  description?: string;
  type: TemplateType;
  category?: string;
  previewUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  usageCount: number;
  config: any;
  user?: {
    name: string;
  };
}

export default function TemplatesPage() {
  // Загрузка шаблонов с кэшированием
  const { data: templatesData, isLoading: loading } = useCache<{ templates: Template[] }>(
    'templates-list',
    async () => {
      const response = await fetch('/api/templates?limit=50');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    { staleTime: 5 * 60 * 1000 } // Кэшировать на 5 минут
  );

  const templates = templatesData?.templates || [];
  const [filteredTemplates, setFilteredTemplates] = React.useState<Template[]>([]);
  const [displayedTemplates, setDisplayedTemplates] = React.useState<Template[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);
  
  // Фильтры
  const [selectedType, setSelectedType] = React.useState<TemplateType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showPremiumOnly, setShowPremiumOnly] = React.useState(false);
  
  // Infinite scroll
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 12;
  const hasMore = displayedTemplates.length < filteredTemplates.length;
  
  // Предпросмотр
  const [previewTemplate, setPreviewTemplate] = React.useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);


  // Применить фильтры
  React.useEffect(() => {
    let filtered = [...templates];

    // Фильтр по типу
    if (selectedType !== 'all') {
      filtered = filtered.filter((t) => t.type === selectedType);
    }

    // Фильтр по категории
    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Фильтр по премиум
    if (showPremiumOnly) {
      filtered = filtered.filter((t) => t.isPremium);
    }

    // Поиск
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
    setPage(1); // Сбросить страницу при изменении фильтров
  }, [templates, selectedType, selectedCategory, debouncedSearchQuery, showPremiumOnly]);

  // Обновить отображаемые шаблоны при изменении фильтров или страницы
  React.useEffect(() => {
    setDisplayedTemplates(filteredTemplates.slice(0, page * itemsPerPage));
  }, [filteredTemplates, page]);

  const loadMore = React.useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setPage((p) => p + 1);
        setLoadingMore(false);
      }, 300);
    }
  }, [loadingMore, hasMore]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: loadingMore,
  });

  const handlePreview = React.useCallback((id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      setPreviewTemplate(template);
      setPreviewOpen(true);
    }
  }, [templates]);

  const handleResetFilters = React.useCallback(() => {
    setSelectedType('all');
    setSelectedCategory('');
    setSearchQuery('');
    setShowPremiumOnly(false);
  }, []);

  return (
    <div className="container py-8">
      {/* Заголовок */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Шаблоны</h1>
          <p className="text-muted-foreground">
            Готовые шаблоны для любых задач — от визиток до постов в соцсетях
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Создать шаблон
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Фильтры */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <TemplateFilters
            selectedType={selectedType}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            showPremiumOnly={showPremiumOnly}
            onTypeChange={setSelectedType}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchQuery}
            onPremiumToggle={setShowPremiumOnly}
            onReset={handleResetFilters}
          />
        </div>

        {/* Галерея */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Показано {displayedTemplates.length} из {filteredTemplates.length} шаблонов
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <TemplateCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border">
              <div className="text-center">
                <div className="mb-4 text-4xl">🔍</div>
                <h3 className="mb-2 text-lg font-semibold">
                  Шаблоны не найдены
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Попробуйте изменить параметры фильтров
                </p>
                <Button variant="outline" onClick={handleResetFilters}>
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedTemplates.map((template, index) => {
                const typeInfo = getTemplateTypeInfo(template.type);
                const categoryInfo = template.category
                  ? getTemplateCategoryInfo(template.category)
                  : null;

                return (
                  <TemplateCard
                    key={template.id}
                    id={template.id}
                    name={template.name}
                    description={template.description}
                    previewUrl={template.previewUrl}
                    thumbnailUrl={template.thumbnailUrl}
                    isPremium={template.isPremium}
                    usageCount={template.usageCount}
                    type={typeInfo?.name || template.type}
                    category={categoryInfo?.name}
                    onPreview={handlePreview}
                    priority={index < 6} // Priority для первых 6 шаблонов (above-the-fold)
                  />
                );
                })}
              </div>

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="mt-8 flex justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Загрузка...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Модальное окно предпросмотра */}
      <TemplatePreviewDialog
        template={previewTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}

