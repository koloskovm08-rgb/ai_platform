'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Sticker } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const StickerEditor = dynamic(
  () => import('@/components/editors/sticker-editor').then((mod) => ({ default: mod.StickerEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора наклеек...</p>
        </div>
      </div>
    ),
  }
);

export default function StickerEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <StickerEditor />
    </div>
  );
}

