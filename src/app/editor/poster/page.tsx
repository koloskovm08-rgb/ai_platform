'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { FileImage } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const PosterEditor = dynamic(
  () => import('@/components/editors/poster-editor').then((mod) => ({ default: mod.PosterEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора постеров...</p>
        </div>
      </div>
    ),
  }
);

export default function PosterEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <PosterEditor />
    </div>
  );
}

