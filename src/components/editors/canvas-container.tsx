'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Grid, Eye, EyeOff, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasZoomPan } from '@/hooks/use-canvas-zoom-pan';
import { Slider } from '@/components/ui/slider';

interface CanvasContainerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function CanvasContainer({
  canvasRef,
  canvasWidth,
  canvasHeight,
  showGrid = false,
  onToggleGrid,
  className,
  children,
}: CanvasContainerProps) {
  const {
    zoom,
    panX,
    panY,
    isPanning,
    containerRef,
    zoomIn,
    zoomOut,
    zoomToFit,
    zoomToActualSize,
    setZoomValue,
    startPan,
    resetPan,
  } = useCanvasZoomPan({
    minZoom: 0.25,
    maxZoom: 4,
    initialZoom: 1,
    enablePan: true,
    enableWheelZoom: true,
  });

  const [showGuides, setShowGuides] = React.useState(true);

  // Обработка клика для pan (если не выбран объект)
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Средняя кнопка мыши или Alt + левая кнопка для pan
      e.preventDefault();
      startPan(e.clientX, e.clientY);
    }
  };

  // Создаем паттерн сетки через CSS
  const gridPattern = React.useMemo(() => {
    if (!showGrid) return 'none';
    const size = 20;
    return `repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${size - 1}px,
      rgba(0, 0, 0, 0.05) ${size - 1}px,
      rgba(0, 0, 0, 0.05) ${size}px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent ${size - 1}px,
      rgba(0, 0, 0, 0.05) ${size - 1}px,
      rgba(0, 0, 0, 0.05) ${size}px
    )`;
  }, [showGrid]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center',
        'bg-gradient-to-br from-muted/30 via-background to-muted/20',
        'rounded-lg p-2 min-h-[400px]',
        'transition-all duration-300',
        'overflow-hidden', // Предотвращаем выход за границы
        'isolate', // Создаем новый stacking context
        className
      )}
      style={{
        backgroundImage: gridPattern,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
      }}
    >
      {/* Canvas контейнер - точно по размеру визитки */}
      <div
        className={cn(
          'relative inline-block',
          'border-2 border-border rounded-lg',
          'shadow-2xl bg-white',
          'transition-transform duration-200',
          'hover:shadow-3xl hover:border-primary/30',
          'animate-scale-in',
          isPanning && 'cursor-grabbing'
        )}
        style={{
          width: canvasWidth,
          height: canvasHeight,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center',
        }}
        onMouseDown={handleContainerMouseDown}
      >
        {/* Направляющие линии - внутри canvas контейнера */}
        {/* Используем opacity вместо условного рендеринга для стабильной DOM структуры */}
        <div 
          className={cn(
            "absolute inset-0 pointer-events-none z-10 transition-opacity duration-300",
            !showGuides && "opacity-0"
          )}
          aria-hidden="true"
        >
          {/* Центральная вертикальная линия */}
          <div
            className="absolute top-0 bottom-0 w-px bg-primary/30"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          />
          {/* Центральная горизонтальная линия */}
          <div
            className="absolute left-0 right-0 h-px bg-primary/30"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          />
          {/* Линии третей */}
          <div
            className="absolute top-0 bottom-0 w-px bg-primary/20"
            style={{ left: `${canvasWidth / 3}px`, transform: 'translateX(-50%)' }}
          />
          <div
            className="absolute top-0 bottom-0 w-px bg-primary/20"
            style={{ left: `${(canvasWidth * 2) / 3}px`, transform: 'translateX(-50%)' }}
          />
          <div
            className="absolute left-0 right-0 h-px bg-primary/20"
            style={{ top: `${canvasHeight / 3}px`, transform: 'translateY(-50%)' }}
          />
          <div
            className="absolute left-0 right-0 h-px bg-primary/20"
            style={{ top: `${(canvasHeight * 2) / 3}px`, transform: 'translateY(-50%)' }}
          />
        </div>

        <canvas
          ref={canvasRef}
          className="block"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            display: 'block',
          }}
        />
        
        {/* Индикатор границ canvas */}
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-primary/20 rounded-lg" />
      </div>

      {/* Панель управления canvas - внутри контейнера */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'bg-background/90 backdrop-blur-sm',
            'transition-all duration-200',
            'hover:scale-110 active:scale-95',
            showGrid && 'bg-primary/10 border-primary/30'
          )}
          onClick={onToggleGrid}
          title={showGrid ? 'Скрыть сетку' : 'Показать сетку'}
        >
          <Grid className={cn('h-4 w-4 transition-transform duration-200', showGrid && 'text-primary')} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'bg-background/90 backdrop-blur-sm',
            'transition-all duration-200',
            'hover:scale-110 active:scale-95',
            !showGuides && 'opacity-50'
          )}
          onClick={() => setShowGuides(!showGuides)}
          title={showGuides ? 'Скрыть направляющие' : 'Показать направляющие'}
        >
          {showGuides ? (
            <Eye className="h-4 w-4 text-primary" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Панель управления zoom - слева */}
      <div className="absolute bottom-2 left-2 flex flex-col gap-2 z-20">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg border p-2 space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Масштаб</span>
            <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => zoomOut()}
              disabled={zoom <= 0.25}
              title="Уменьшить"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Slider
              value={[zoom]}
              min={0.25}
              max={4}
              step={0.1}
              onValueChange={([value]) => setZoomValue(value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => zoomIn()}
              disabled={zoom >= 4}
              title="Увеличить"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => zoomToFit(canvasWidth, canvasHeight)}
              title="Подогнать"
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              По размеру
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={zoomToActualSize}
              title="100%"
            >
              100%
            </Button>
            {(panX !== 0 || panY !== 0) && (
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={resetPan}
                title="Сбросить позицию"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

