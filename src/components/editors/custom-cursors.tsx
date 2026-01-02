'use client';

import * as React from 'react';
import type { Canvas } from 'fabric';

export type ToolType = 
  | 'select' 
  | 'text' 
  | 'brush' 
  | 'eraser' 
  | 'shape' 
  | 'move' 
  | 'zoom' 
  | 'hand';

/**
 * Создает SVG курсор для указанного типа инструмента
 */
export function createCursorSVG(toolType: ToolType): string {
  const svgs: Record<ToolType, string> = {
    select: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="currentColor" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M12.58 12.58L19.97 10.07" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `,
    text: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H20M4 8H20M4 12H14M4 16H10M4 20H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="18" cy="18" r="3" fill="currentColor" stroke="white" stroke-width="1"/>
      </svg>
    `,
    brush: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.06 15.94L4.06 20.94C3.67 21.33 3.67 21.96 4.06 22.35C4.45 22.74 5.08 22.74 5.47 22.35L10.47 17.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.5 5.5C19.3284 4.67157 19.3284 3.32843 18.5 2.5C17.6716 1.67157 16.3284 1.67157 15.5 2.5L8.5 9.5L14.5 15.5L21.5 8.5C22.3284 7.67157 22.3284 6.32843 21.5 5.5C20.6716 4.67157 19.3284 4.67157 18.5 5.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="white" stroke-width="1"/>
      </svg>
    `,
    eraser: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M8 8L4 4M20 8L16 4M8 20L4 16M20 20L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="14" cy="14" r="2" fill="currentColor" stroke="white" stroke-width="1"/>
      </svg>
    `,
    shape: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="white" stroke-width="1"/>
      </svg>
    `,
    move: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 9L2 12L5 15M19 9L22 12L19 15M9 5L12 2L15 5M9 19L12 22L15 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="white" stroke-width="1"/>
      </svg>
    `,
    zoom: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
        <path d="M20 20L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M11 8V14M8 11H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="11" cy="11" r="2" fill="currentColor" stroke="white" stroke-width="1"/>
      </svg>
    `,
    hand: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 11V8C18 6.34315 16.6569 5 15 5C13.3431 5 12 6.34315 12 8V11M12 11V9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9V11M12 11V13M6 11V15C6 17.2091 7.79086 19 10 19H14C16.2091 19 18 17.2091 18 15V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="white" stroke-width="1"/>
      </svg>
    `,
  };

  return svgs[toolType] || svgs.select;
}

/**
 * Конвертирует SVG в data URL для использования в CSS cursor
 */
export function svgToDataURL(svg: string): string {
  const encoded = encodeURIComponent(svg.trim());
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Устанавливает кастомный курсор на canvas
 */
export function setCanvasCursor(canvas: Canvas | null, toolType: ToolType): void {
  if (!canvas) return;

  const svg = createCursorSVG(toolType);
  const dataURL = svgToDataURL(svg);
  
  // Устанавливаем курсор через CSS
  const canvasElement = canvas.getElement();
  if (canvasElement) {
    // Для разных инструментов используем разные курсоры
    switch (toolType) {
      case 'select':
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        canvasElement.style.cursor = 'default';
        break;
      case 'text':
        canvas.defaultCursor = 'text';
        canvas.hoverCursor = 'text';
        canvasElement.style.cursor = `url("${dataURL}") 12 12, text`;
        break;
      case 'brush':
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        canvasElement.style.cursor = `url("${dataURL}") 12 12, crosshair`;
        break;
      case 'eraser':
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        canvasElement.style.cursor = `url("${dataURL}") 12 12, grab`;
        break;
      case 'shape':
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        canvasElement.style.cursor = `url("${dataURL}") 12 12, crosshair`;
        break;
      case 'move':
        canvas.defaultCursor = 'move';
        canvas.hoverCursor = 'move';
        canvasElement.style.cursor = `url("${dataURL}") 12 12, move`;
        break;
      case 'zoom':
        canvas.defaultCursor = 'zoom-in';
        canvas.hoverCursor = 'zoom-in';
        canvasElement.style.cursor = `url("${dataURL}") 12 12, zoom-in`;
        break;
      case 'hand':
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        canvasElement.style.cursor = `url("${dataURL}") 12 12, grab`;
        break;
      default:
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';
        canvasElement.style.cursor = 'default';
    }
  }
}

/**
 * Хук для управления курсором в редакторе
 */
export function useCustomCursor(canvas: Canvas | null, toolType: ToolType) {
  React.useEffect(() => {
    setCanvasCursor(canvas, toolType);
  }, [canvas, toolType]);

  return {
    setCursor: (type: ToolType) => setCanvasCursor(canvas, type),
  };
}

