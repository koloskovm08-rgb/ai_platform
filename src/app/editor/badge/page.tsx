'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Badge as BadgeIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Динамический импорт редактора
const BadgeEditor = dynamic(
  () => import('@/components/editors/badge-editor').then((mod) => ({ default: mod.BadgeEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора значков...</p>
        </div>
      </div>
    ),
  }
);

export default function BadgeEditorPage() {
  return (
    <div className="container py-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BadgeIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Редактор значков</h1>
            <p className="text-sm text-muted-foreground">
              Создавайте значки любой формы и размера
            </p>
          </div>
        </div>
      </div>
      <BadgeEditor />
    </div>
  );
}

