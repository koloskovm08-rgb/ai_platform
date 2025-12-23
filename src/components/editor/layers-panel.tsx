'use client';

import * as React from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Layer {
  id: number;
  type?: string;
  visible: boolean;
  name: string;
  object: fabric.Object;
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
}: LayersPanelProps) {
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
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Слои ({layers.length})</h3>
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
}) {
  const [showControls, setShowControls] = React.useState(false);

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
        <span className="flex-1 text-sm font-medium truncate">
          {layer.name}
        </span>

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

