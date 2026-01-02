'use client';

import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import type { Canvas } from 'fabric';

export interface UseFabricCanvasOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export function useFabricCanvas(options: UseFabricCanvasOptions = {}) {
  const { width = 800, height = 600, backgroundColor = '#ffffff' } = options;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const saveHistory = (canvas: Canvas) => {
    const json = JSON.stringify(canvas.toJSON());
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(json);
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    let isMounted = true;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      preserveObjectStacking: true,
    });

    if (isMounted) {
      setCanvas(fabricCanvas);
      saveHistory(fabricCanvas);
    }

    return () => {
      isMounted = false;
      try {
        // Очищаем все объекты перед dispose
        if (fabricCanvas) {
          fabricCanvas.remove(...fabricCanvas.getObjects());
          fabricCanvas.dispose();
        }
      } catch {
        // Игнорируем ошибки при dispose (элемент может быть уже удален React)
        // Это нормально при unmount компонента
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Canvas создается один раз при монтировании

  const undo = () => {
    if (!canvas || historyStep <= 0) return;

    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    
    canvas.loadFromJSON(history[newStep], () => {
      canvas.renderAll();
    });
  };

  const redo = () => {
    if (!canvas || historyStep >= history.length - 1) return;

    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    
    canvas.loadFromJSON(history[newStep], () => {
      canvas.renderAll();
    });
  };

  const canUndo = historyStep > 0;
  const canRedo = historyStep < history.length - 1;

  return {
    canvasRef,
    canvas,
    saveHistory: () => canvas && saveHistory(canvas),
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

