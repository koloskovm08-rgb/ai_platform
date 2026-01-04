'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { PublishDialog, type PublishDialogProps } from '@/components/social/publish-dialog';

type SocialContentType = 'GENERATION' | 'EDIT' | 'BUSINESS_CARD_PROJECT';

export interface PublishButtonProps {
  contentType: SocialContentType;
  contentId: string;
  imageUrl?: string;
  defaultCaption?: string;

  defaultPlatform?: PublishDialogProps['defaultPlatform'];

  buttonVariant?: ButtonProps['variant'];
  buttonSize?: ButtonProps['size'];
  className?: string;
}

export function PublishButton({
  contentType,
  contentId,
  imageUrl,
  defaultCaption,
  defaultPlatform,
  buttonVariant = 'ghost',
  buttonSize = 'sm',
  className,
}: PublishButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={className}
        onClick={() => setOpen(true)}
        aria-label="Опубликовать в соцсети"
      >
        <Send className="h-4 w-4" />
      </Button>

      <PublishDialog
        open={open}
        onOpenChange={setOpen}
        contentType={contentType}
        contentId={contentId}
        imageUrl={imageUrl}
        defaultCaption={defaultCaption}
        defaultPlatform={defaultPlatform}
      />
    </>
  );
}


