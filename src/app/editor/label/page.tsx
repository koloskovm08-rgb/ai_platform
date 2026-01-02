'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Tag } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LabelEditor = dynamic(
  () => import('@/components/editors/label-editor').then((mod) => ({ default: mod.LabelEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора этикеток...</p>
        </div>
      </div>
    ),
  }
);

export default function LabelEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <LabelEditor />
    </div>
  );
}

