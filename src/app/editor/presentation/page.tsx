'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Presentation } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const PresentationEditor = dynamic(
  () => import('@/components/editors/presentation-editor').then((mod) => ({ default: mod.PresentationEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора презентаций...</p>
        </div>
      </div>
    ),
  }
);

export default function PresentationEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <PresentationEditor />
    </div>
  );
}

