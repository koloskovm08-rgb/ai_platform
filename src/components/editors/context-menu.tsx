'use client';

import * as React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Copy,
  Trash2,
  CopyPlus,
  BringToFront,
  SendToBack,
  Lock,
  Unlock,
  Group,
  Ungroup,
} from 'lucide-react';
import type { Canvas, FabricObject } from 'fabric';

interface CanvasContextMenuProps {
  canvas: Canvas | null;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  children: React.ReactNode;
}

export function CanvasContextMenu({
  canvas,
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onLock,
  onUnlock,
  onGroup,
  onUngroup,
  children,
}: CanvasContextMenuProps) {
  const [selectedObject, setSelectedObject] = React.useState<FabricObject | null>(null);
  const [isLocked, setIsLocked] = React.useState(false);
  const [isGrouped, setIsGrouped] = React.useState(false);

  React.useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      setSelectedObject(activeObject || null);
      setIsLocked(activeObject?.selectable === false);
      setIsGrouped(activeObject?.type === 'group');
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setIsLocked(false);
      setIsGrouped(false);
    });

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleSelection);
    };
  }, [canvas]);

  const handleCopy = () => {
    if (!canvas || !selectedObject) return;
    const json = JSON.stringify(selectedObject.toObject());
    navigator.clipboard.writeText(json);
    onCopy?.();
  };

  const handlePaste = async () => {
    if (!canvas) return;
    try {
      const text = await navigator.clipboard.readText();
      const obj = JSON.parse(text);
      const fabricModule = await import('fabric');
      fabricModule.FabricObject.fromObject(obj).then((obj) => {
        obj.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
        const fabricObj = obj as FabricObject;
        canvas.add(fabricObj);
        canvas.setActiveObject(fabricObj);
        canvas.renderAll();
      });
      onPaste?.();
    } catch (error) {
      console.error('Paste error:', error);
    }
  };

  const handleDelete = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.renderAll();
    onDelete?.();
  };

  const handleDuplicate = () => {
    if (!canvas || !selectedObject) return;
    selectedObject.clone().then((cloned: FabricObject) => {
      cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      onDuplicate?.();
    });
  };

  const handleBringToFront = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringObjectToFront(selectedObject);
    canvas.renderAll();
    onBringToFront?.();
  };

  const handleSendToBack = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendObjectToBack(selectedObject);
    canvas.renderAll();
    onSendToBack?.();
  };

  const handleLock = () => {
    if (!canvas || !selectedObject) return;
    selectedObject.set({ selectable: false, evented: false });
    canvas.renderAll();
    setIsLocked(true);
    onLock?.();
  };

  const handleUnlock = () => {
    if (!canvas || !selectedObject) return;
    selectedObject.set({ selectable: true, evented: true });
    canvas.renderAll();
    setIsLocked(false);
    onUnlock?.();
  };

  const handleGroup = async () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 1) {
      const fabric = await import('fabric');
      const group = new fabric.Group(activeObjects, {
        left: canvas.getCenter().left,
        top: canvas.getCenter().top,
      });
      canvas.remove(...activeObjects);
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      onGroup?.();
    }
  };

  const handleUngroup = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'group') return;
    const group = selectedObject as any;
    const objects = group.getObjects();
    group.destroy();
    objects.forEach((obj: FabricObject) => {
      obj.setCoords();
      canvas.add(obj);
    });
    canvas.renderAll();
    onUngroup?.();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {selectedObject && (
          <>
            <ContextMenuItem onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Копировать
            </ContextMenuItem>
            <ContextMenuItem onClick={handlePaste}>
              Вставить
            </ContextMenuItem>
            <ContextMenuItem onClick={handleDuplicate}>
              <CopyPlus className="mr-2 h-4 w-4" />
              Дублировать
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleBringToFront}>
              <BringToFront className="mr-2 h-4 w-4" />
              На передний план
            </ContextMenuItem>
            <ContextMenuItem onClick={handleSendToBack}>
              <SendToBack className="mr-2 h-4 w-4" />
              На задний план
            </ContextMenuItem>
            <ContextMenuSeparator />
            {isLocked ? (
              <ContextMenuItem onClick={handleUnlock}>
                <Unlock className="mr-2 h-4 w-4" />
                Разблокировать
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={handleLock}>
                <Lock className="mr-2 h-4 w-4" />
                Заблокировать
              </ContextMenuItem>
            )}
            {isGrouped ? (
              <ContextMenuItem onClick={handleUngroup}>
                <Ungroup className="mr-2 h-4 w-4" />
                Разгруппировать
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={handleGroup}>
                <Group className="mr-2 h-4 w-4" />
                Группировать
              </ContextMenuItem>
            )}
          </>
        )}
        {!selectedObject && (
          <ContextMenuItem onClick={handlePaste}>Вставить</ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

