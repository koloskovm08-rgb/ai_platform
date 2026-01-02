'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Award } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const CertificateEditor = dynamic(
  () => import('@/components/editors/certificate-editor').then((mod) => ({ default: mod.CertificateEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка редактора сертификатов...</p>
        </div>
      </div>
    ),
  }
);

export default function CertificateEditorPage() {
  return (
    <div className="h-screen overflow-hidden">
      <CertificateEditor />
    </div>
  );
}

