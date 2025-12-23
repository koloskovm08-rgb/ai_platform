'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

export interface UseFabricCanvasOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export function useFabricCanvas(options: UseFabricCanvasOptions = {}) {
  const { width = 800, height = 600, backgroundColor = '#ffffff' } = options;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      preserveObjectStacking: true,
    });

    setCanvas(fabricCanvas);
    saveHistory(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const saveHistory = (canvas: fabric.Canvas) => {
    const json = JSON.stringify(canvas.toJSON());
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(json);
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  };

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

