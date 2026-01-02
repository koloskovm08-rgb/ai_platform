'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Megaphone } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const FlyerEditor = dynamic(
  () => import('@/components/editors/flyer-editor').then((mod) => ({ default: mod.FlyerEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора флаеров...</p>
        </div>
      </div>
    ),
  }
);

export default function FlyerEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <FlyerEditor />
    </div>
  );
}

