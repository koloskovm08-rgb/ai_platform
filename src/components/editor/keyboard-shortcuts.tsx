'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { getShortcutDisplay, type KeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Модальное окно со списком горячих клавиш
 */
export function KeyboardShortcuts({
  shortcuts,
  open,
  onOpenChange,
}: KeyboardShortcutsProps) {
  // Группируем горячие клавиши по категориям
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {
      'История': [],
      'Редактирование': [],
      'Экспорт': [],
      'Справка': [],
    };

    shortcuts.forEach((shortcut) => {
      if (shortcut.key === 'z' || shortcut.key === 'y') {
        groups['История'].push(shortcut);
      } else if (shortcut.key === 'Delete' || shortcut.key === 'Backspace') {
        groups['Редактирование'].push(shortcut);
      } else if (shortcut.key === 's' || shortcut.key === 'e') {
        groups['Экспорт'].push(shortcut);
      } else {
        groups['Справка'].push(shortcut);
      }
    });

    return groups;
  }, [shortcuts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Горячие клавиши
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
            if (categoryShortcuts.length === 0) return null;

            return (
              <Card key={category} className="p-4">
                <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                        {getShortcutDisplay(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          💡 Совет: Горячие клавиши работают везде, кроме полей ввода текста
        </div>
      </DialogContent>
    </Dialog>
  );
}

