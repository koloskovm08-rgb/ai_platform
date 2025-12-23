'use client';

import * as React from 'react';
import type { Rect } from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { Toolbar } from './toolbar';
import { FiltersPanel } from './filters-panel';
import {
  addText,
  addRectangle,
  addCircle,
  addTriangle,
  addRectangleWithGradient,
  addCircleWithGradient,
  deleteSelected,
  rotateCanvas,
  flipHorizontal,
  applyFilter,
  clearFilters,
  exportAsImage,
  loadImageToCanvas,
  enableCropMode,
  applyCrop,
  cancelCrop,
  enableDrawingMode,
  disableDrawingMode,
  setBrushSettings,
  getLayers,
  moveLayerUp,
  moveLayerDown,
  moveLayerToTop,
  moveLayerToBottom,
  toggleLayerVisibility,
  deleteLayer,
  selectLayer,
} from '@/lib/utils/image-editor';
import { LayersPanel } from './layers-panel';

interface ImageEditorProps {
  initialImageUrl?: string;
  width?: number;
  height?: number;
}

export function ImageEditor({
  initialImageUrl,
  width = 800,
  height = 600,
}: ImageEditorProps) {
  const {
    canvasRef,
    canvas,
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFabricCanvas({ width, height });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [cropRect, setCropRect] = React.useState<Rect | null>(null);
  const [isDrawingMode, setIsDrawingMode] = React.useState(false);
  const [layers, setLayers] = React.useState<any[]>([]);
  const [activeLayerId, setActiveLayerId] = React.useState<number | undefined>();

  // Загрузка начального изображения
  React.useEffect(() => {
    if (canvas && initialImageUrl) {
      loadImageToCanvas(canvas, initialImageUrl, saveHistory);
    }
  }, [canvas, initialImageUrl]);

  // Сохранять историю после каждого изменения
  React.useEffect(() => {
    if (!canvas) return;

    const handleModified = () => {
      saveHistory();
      updateLayers();
    };
    
    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objects = canvas.getObjects();
        const index = objects.indexOf(activeObject);
        setActiveLayerId(index);
      } else {
        setActiveLayerId(undefined);
      }
    };

    canvas.on('object:modified', handleModified);
    canvas.on('object:added', handleModified);
    canvas.on('object:removed', handleModified);
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setActiveLayerId(undefined));

    return () => {
      canvas.off('object:modified', handleModified);
      canvas.off('object:added', handleModified);
      canvas.off('object:removed', handleModified);
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared');
    };
  }, [canvas, saveHistory]);

  // Обновление списка слоёв
  const updateLayers = React.useCallback(() => {
    if (!canvas) return;
    const newLayers = getLayers(canvas);
    setLayers(newLayers);
  }, [canvas]);

  // Обновляем слои при загрузке
  React.useEffect(() => {
    if (canvas) {
      updateLayers();
    }
  }, [canvas, updateLayers]);

  const handleLoadImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      loadImageToCanvas(canvas, imageUrl, () => {
        saveHistory();
        updateLayers();
      });
    };
    reader.readAsDataURL(file);
  };

  // Обработчики для новых инструментов
  const handleEnableCrop = () => {
    if (!canvas) return;
    const rect = enableCropMode(canvas);
    setCropRect(rect);
  };

  const handleApplyCrop = () => {
    if (!canvas || !cropRect) return;
    applyCrop(canvas, cropRect);
    setCropRect(null);
    saveHistory();
    updateLayers();
  };

  const handleCancelCrop = () => {
    if (!canvas || !cropRect) return;
    cancelCrop(canvas, cropRect);
    setCropRect(null);
  };

  const handleToggleDrawing = (enabled: boolean) => {
    if (!canvas) return;
    if (enabled) {
      enableDrawingMode(canvas);
    } else {
      disableDrawingMode(canvas);
    }
    setIsDrawingMode(enabled);
  };

  const handleBrushColorChange = (color: string) => {
    if (!canvas) return;
    setBrushSettings(canvas, color, undefined);
  };

  const handleBrushWidthChange = (width: number) => {
    if (!canvas) return;
    setBrushSettings(canvas, undefined, width);
  };

  if (!canvas) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-muted-foreground">Загрузка редактора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Левая панель - Инструменты */}
      <div className="w-64 flex-shrink-0 overflow-y-auto space-y-4">
        <Toolbar
          onAddText={() => {
            addText(canvas);
            saveHistory();
            updateLayers();
          }}
          onAddRectangle={() => {
            addRectangle(canvas);
            saveHistory();
            updateLayers();
          }}
          onAddCircle={() => {
            addCircle(canvas);
            saveHistory();
            updateLayers();
          }}
          onAddTriangle={() => {
            addTriangle(canvas);
            saveHistory();
            updateLayers();
          }}
          onAddRectangleGradient={() => {
            addRectangleWithGradient(canvas);
            saveHistory();
            updateLayers();
          }}
          onAddCircleGradient={() => {
            addCircleWithGradient(canvas);
            saveHistory();
            updateLayers();
          }}
          onLoadImage={handleLoadImage}
          onEnableCrop={handleEnableCrop}
          onToggleDrawing={handleToggleDrawing}
          onBrushColorChange={handleBrushColorChange}
          onBrushWidthChange={handleBrushWidthChange}
          onDelete={() => {
            deleteSelected(canvas);
            saveHistory();
            updateLayers();
          }}
          onRotate={() => {
            rotateCanvas(canvas, 90);
            saveHistory();
          }}
          onFlip={() => {
            flipHorizontal(canvas);
            saveHistory();
          }}
          onUndo={undo}
          onRedo={redo}
          onExport={(format) => exportAsImage(canvas, format, 'edited-image')}
          canUndo={canUndo}
          canRedo={canRedo}
          isDrawingMode={isDrawingMode}
        />

        {/* Панель слоёв */}
        <LayersPanel
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={(layer) => selectLayer(canvas, layer.object)}
          onToggleVisibility={(layer) => {
            toggleLayerVisibility(canvas, layer.object);
            updateLayers();
          }}
          onMoveUp={(layer) => {
            moveLayerUp(canvas, layer.object);
            updateLayers();
          }}
          onMoveDown={(layer) => {
            moveLayerDown(canvas, layer.object);
            updateLayers();
          }}
          onMoveToTop={(layer) => {
            moveLayerToTop(canvas, layer.object);
            updateLayers();
          }}
          onMoveToBottom={(layer) => {
            moveLayerToBottom(canvas, layer.object);
            updateLayers();
          }}
          onDelete={(layer) => {
            deleteLayer(canvas, layer.object);
            saveHistory();
            updateLayers();
          }}
        />
      </div>

      {/* Центральная область - Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg border">
          <div className="relative">
            <canvas ref={canvasRef} />
          </div>
        </div>
        
        {/* Панель действий для обрезки */}
        {cropRect && (
          <div className="mt-4 p-4 bg-primary/10 border border-primary rounded-lg flex items-center justify-between">
            <p className="text-sm font-medium">
              Режим обрезки: измените размер выделения
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelCrop}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleApplyCrop}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Применить обрезку
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Правая панель - Фильтры */}
      <div className="w-64 flex-shrink-0 overflow-y-auto">
        <FiltersPanel
          onApplyFilter={(filterType, value) => {
            applyFilter(canvas, filterType, value);
          }}
          onClearFilters={() => {
            clearFilters(canvas);
            canvas.renderAll();
          }}
        />
      </div>

      {/* Скрытый input для загрузки файлов */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

