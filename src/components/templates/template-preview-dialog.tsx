'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Crown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  previewUrl: string;
  isPremium: boolean;
  usageCount: number;
  config: Record<string, unknown>;
  user?: {
    name: string;
  };
}

interface TemplatePreviewDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
}: TemplatePreviewDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DialogTitle>{template.name}</DialogTitle>
              {template.isPremium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                  <Crown className="h-3 w-3" />
                  Premium
                </span>
              )}
            </div>
            {template.description && (
              <DialogDescription>{template.description}</DialogDescription>
            )}
          </div>
        </DialogHeader>

        {/* Предпросмотр изображения */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
          <Image
            src={template.previewUrl}
            alt={template.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>

        {/* Информация */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Тип:</span>
            <p className="text-muted-foreground">{template.type}</p>
          </div>
          {template.category && (
            <div>
              <span className="font-medium">Категория:</span>
              <p className="text-muted-foreground capitalize">
                {template.category}
              </p>
            </div>
          )}
          <div>
            <span className="font-medium">Использований:</span>
            <p className="text-muted-foreground">{template.usageCount}</p>
          </div>
          {template.user && (
            <div>
              <span className="font-medium">Автор:</span>
              <p className="text-muted-foreground">{template.user.name}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <Button asChild>
            <Link href={`/edit?template=${template.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Использовать шаблон
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

