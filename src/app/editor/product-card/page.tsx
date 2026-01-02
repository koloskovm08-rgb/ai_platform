'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { ShoppingCart } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Динамический импорт редактора
const ProductCardEditor = dynamic(
  () => import('@/components/editors/product-card-editor').then((mod) => ({ default: mod.ProductCardEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора карточек товаров...</p>
        </div>
      </div>
    ),
  }
);

export default function ProductCardEditorPage() {
  return (
    <div className="container py-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Редактор карточек товаров</h1>
            <p className="text-sm text-muted-foreground">
              Создавайте карточки товаров для маркетплейсов
            </p>
          </div>
        </div>
      </div>
      <ProductCardEditor />
    </div>
  );
}

