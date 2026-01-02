'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface ZoomPanState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface UseCanvasZoomPanOptions {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  enablePan?: boolean;
  enableWheelZoom?: boolean;
}

export function useCanvasZoomPan(options: UseCanvasZoomPanOptions = {}) {
  const {
    minZoom = 0.25,
    maxZoom = 4,
    initialZoom = 1,
    enablePan = true,
    enableWheelZoom = true,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom функции
  const zoomIn = useCallback((step: number = 0.1) => {
    setZoom((prev) => Math.min(maxZoom, prev + step));
  }, [maxZoom]);

  const zoomOut = useCallback((step: number = 0.1) => {
    setZoom((prev) => Math.max(minZoom, prev - step));
  }, [minZoom]);

  const zoomToFit = useCallback((canvasWidth: number, canvasHeight: number) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 32; // padding
    const containerHeight = container.clientHeight - 32;
    
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const newZoom = Math.min(scaleX, scaleY, maxZoom) * 0.9; // 90% для отступов
    
    setZoom(Math.max(minZoom, newZoom));
    setPanX(0);
    setPanY(0);
  }, [minZoom, maxZoom]);

  const zoomToActualSize = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const setZoomValue = useCallback((value: number) => {
    setZoom(Math.max(minZoom, Math.min(maxZoom, value)));
  }, [minZoom, maxZoom]);

  // Pan функции
  const startPan = useCallback((clientX: number, clientY: number) => {
    if (!enablePan) return;
    setIsPanning(true);
    panStartRef.current = {
      x: clientX - panX,
      y: clientY - panY,
    };
  }, [enablePan, panX, panY]);

  const updatePan = useCallback((clientX: number, clientY: number) => {
    if (!isPanning || !enablePan) return;
    setPanX(clientX - panStartRef.current.x);
    setPanY(clientY - panStartRef.current.y);
  }, [isPanning, enablePan]);

  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetPan = useCallback(() => {
    setPanX(0);
    setPanY(0);
  }, []);

  // Обработка колесика мыши для zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enableWheelZoom) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => {
          const newZoom = prev + delta;
          return Math.max(minZoom, Math.min(maxZoom, newZoom));
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [enableWheelZoom, minZoom, maxZoom]);

  // Обработка перетаскивания для pan
  useEffect(() => {
    if (!enablePan) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        updatePan(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      endPan();
    };

    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, enablePan, updatePan, endPan]);

  return {
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
    updatePan,
    endPan,
    resetPan,
  };
}

