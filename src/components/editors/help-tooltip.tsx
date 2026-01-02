'use client';

import * as React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HelpTooltipProps {
  title: string;
  content: React.ReactNode;
  shortcut?: string;
  children?: React.ReactNode;
}

export function HelpTooltip({ title, content, shortcut, children }: HelpTooltipProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setOpen(true)}
        title={title}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {shortcut && (
              <DialogDescription>
                Горячая клавиша: <kbd className="px-2 py-1 bg-muted rounded text-sm">{shortcut}</kbd>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4">{content}</div>
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
}

interface KeyboardShortcutsHelpProps {
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Горячие клавиши</CardTitle>
        <CardDescription>Быстрый доступ к функциям редактора</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 bg-muted rounded text-xs font-mono"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

