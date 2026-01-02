'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Gift } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const GreetingCardEditor = dynamic(
  () => import('@/components/editors/greeting-card-editor').then((mod) => ({ default: mod.GreetingCardEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора открыток...</p>
        </div>
      </div>
    ),
  }
);

export default function GreetingCardEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <GreetingCardEditor />
    </div>
  );
}

