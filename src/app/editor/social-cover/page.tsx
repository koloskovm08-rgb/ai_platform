'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Share2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const SocialCoverEditor = dynamic(
  () => import('@/components/editors/social-cover-editor').then((mod) => ({ default: mod.SocialCoverEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора обложек...</p>
        </div>
      </div>
    ),
  }
);

export default function SocialCoverEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <SocialCoverEditor />
    </div>
  );
}

