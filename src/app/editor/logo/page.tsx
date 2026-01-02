'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LogoEditor = dynamic(
  () => import('@/components/editors/logo-editor').then((mod) => ({ default: mod.LogoEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора логотипов...</p>
        </div>
      </div>
    ),
  }
);

export default function LogoEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <LogoEditor />
    </div>
  );
}

