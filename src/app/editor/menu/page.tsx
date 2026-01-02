'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { BookOpen } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const MenuEditor = dynamic(
  () => import('@/components/editors/menu-editor').then((mod) => ({ default: mod.MenuEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора меню...</p>
        </div>
      </div>
    ),
  }
);

export default function MenuEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <MenuEditor />
    </div>
  );
}

