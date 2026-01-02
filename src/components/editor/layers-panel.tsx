'use client';

import * as React from 'react';
import type { Object as FabricObject } from 'fabric';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Layers,
  Lock,
  Unlock,
  Group,
  Ungroup,
  Edit2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Layer {
  id: number;
  type?: string;
  visible: boolean;
  name: string;
  object: FabricObject;
  locked?: boolean;
}

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId?: number;
  onSelectLayer: (layer: Layer) => void;
  onToggleVisibility: (layer: Layer) => void;
  onMoveUp: (layer: Layer) => void;
  onMoveDown: (layer: Layer) => void;
  onMoveToTop: (layer: Layer) => void;
  onMoveToBottom: (layer: Layer) => void;
  onDelete: (layer: Layer) => void;
  onRename?: (layer: Layer, newName: string) => void;
  onToggleLock?: (layer: Layer) => void;
  onGroup?: () => void;
  onUngroup?: () => void;
}

/**
 * Панель управления слоями
 * Показывает все объекты на canvas и позволяет управлять ими
 */
export function LayersPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  onDelete,
  onRename,
  onToggleLock,
  onGroup,
  onUngroup,
}: LayersPanelProps) {
  const selectedLayers = layers.filter((l) => l.id === activeLayerId);
  const canGroup = selectedLayers.length >= 2;
  const canUngroup = selectedLayers.length === 1 && selectedLayers[0]?.type === 'group';
  if (layers.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Layers className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">Нет слоёв</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Добавьте объекты на canvas
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Слои ({layers.length})</h3>
          </div>
          {(onGroup || onUngroup) && (
            <div className="flex gap-1">
              {onGroup && canGroup && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={onGroup}
                  title="Группировать"
                >
                  <Group className="h-3 w-3" />
                </Button>
              )}
              {onUngroup && canUngroup && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={onUngroup}
                  title="Разгруппировать"
                >
                  <Ungroup className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {layers.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              isActive={layer.id === activeLayerId}
              onSelect={() => onSelectLayer(layer)}
              onToggleVisibility={() => onToggleVisibility(layer)}
              onMoveUp={() => onMoveUp(layer)}
              onMoveDown={() => onMoveDown(layer)}
              onMoveToTop={() => onMoveToTop(layer)}
              onMoveToBottom={() => onMoveToBottom(layer)}
              onDelete={() => onDelete(layer)}
              onRename={onRename ? (name) => onRename(layer, name) : undefined}
              onToggleLock={onToggleLock ? () => onToggleLock(layer) : undefined}
              isLocked={layer.object.selectable === false}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

/**
 * Элемент слоя
 */
function LayerItem({
  layer,
  isActive,
  onSelect,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  onDelete,
  onRename,
  onToggleLock,
  isLocked,
}: {
  layer: Layer;
  isActive: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
  onDelete: () => void;
  onRename?: (name: string) => void;
  onToggleLock?: () => void;
  isLocked?: boolean;
}) {
  const [showControls, setShowControls] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(layer.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRename = () => {
    if (onRename && editedName.trim()) {
      onRename(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditedName(layer.name);
      setIsEditing(false);
    }
  };

  // Иконка типа объекта
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'i-text':
      case 'text':
        return '📝';
      case 'rect':
        return '▭';
      case 'circle':
        return '●';
      case 'triangle':
        return '▲';
      case 'path':
        return '✏️';
      case 'image':
        return '🖼️';
      default:
        return '📦';
    }
  };

  return (
    <div
      className={cn(
        'group relative p-2 rounded-lg border transition-all cursor-pointer',
        isActive
          ? 'bg-primary/10 border-primary'
          : 'bg-background border-border hover:bg-muted/50'
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="flex items-center gap-2" onClick={onSelect}>
        {/* Иконка типа */}
        <span className="text-lg">{getTypeIcon(layer.type)}</span>

        {/* Название */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm font-medium px-1 py-0.5 border rounded"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm font-medium truncate">
            {layer.name}
          </span>
        )}

        {/* Блокировка */}
        {onToggleLock && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
            title={isLocked ? 'Разблокировать' : 'Заблокировать'}
          >
            {isLocked ? (
              <Lock className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Видимость */}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
        >
          {layer.visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Контролы (показываются при наведении) */}
      {showControls && (
        <div className="mt-2 flex items-center justify-between gap-1">
          {/* Перемещение */}
          <div className="flex gap-0.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-1"
              onClick={onMoveToTop}
              title="На передний план"
            >
              <ChevronsUp className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-1"
              onClick={onMoveUp}
              title="Выше"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-1"
              onClick={onMoveDown}
              title="Ниже"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-1"
              onClick={onMoveToBottom}
              title="На задний план"
            >
              <ChevronsDown className="h-3 w-3" />
            </Button>
          </div>

          {/* Переименование */}
          {onRename && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Переименовать"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}

          {/* Удаление */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={onDelete}
            title="Удалить"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

