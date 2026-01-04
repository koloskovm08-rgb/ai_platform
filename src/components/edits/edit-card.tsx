'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ImageIcon,
  ExternalLink,
  Trash2,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { PublishButton } from '@/components/social/publish-button';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EditCardProps {
  edit: {
    id: string;
    originalImageUrl: string;
    editedImageUrl: string;
    thumbnailUrl: string | null;
    operations: Record<string, unknown>;
    createdAt: Date | string;
  };
  onDelete?: (id: string) => void;
}

/**
 * Карточка редактирования изображения
 * Показывает превью до/после, операции, дату
 */
export function EditCard({ edit, onDelete }: EditCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Форматирование даты
  const timeAgo = formatDistanceToNow(new Date(edit.createdAt), {
    addSuffix: true,
    locale: ru,
  });

  // Подсчет операций
  const operationsCount = Array.isArray(edit.operations)
    ? edit.operations.length
    : 0;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/edits?id=${edit.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить');
      }

      setShowDeleteDialog(false);
      onDelete?.(edit.id);
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить редактирование');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Изображения До/После */}
      <div className="relative aspect-[4/3] bg-muted">
        <div className="grid grid-cols-2 h-full">
          {/* До */}
          <div className="relative border-r">
            {edit.originalImageUrl ? (
              <Image
                src={edit.originalImageUrl}
                alt="До редактирования"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                До
              </Badge>
            </div>
          </div>

          {/* После */}
          <div className="relative">
            {edit.thumbnailUrl || edit.editedImageUrl ? (
              <Image
                src={edit.thumbnailUrl || edit.editedImageUrl}
                alt="После редактирования"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge className="text-xs">После</Badge>
            </div>
          </div>
        </div>

        {/* Оверлей с действиями */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" asChild>
            <Link href={`/edit?editId=${edit.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Открыть
            </Link>
          </Button>

          <PublishButton
            contentType="EDIT"
            contentId={edit.id}
            imageUrl={edit.editedImageUrl}
            buttonVariant="default"
            buttonSize="sm"
          />

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Удалить редактирование?</DialogTitle>
                <DialogDescription>
                  Это действие нельзя отменить. Редактирование будет удалено
                  навсегда.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Отмена
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Удаление...
                    </>
                  ) : (
                    'Удалить'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Информация */}
      <div className="p-4 space-y-3">
        {/* Операции */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
            <span>
              {operationsCount}{' '}
              {operationsCount === 1
                ? 'операция'
                : operationsCount < 5
                ? 'операции'
                : 'операций'}
            </span>
          </div>
        </div>

        {/* Дата */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </Card>
  );
}

