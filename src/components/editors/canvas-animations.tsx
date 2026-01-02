'use client';

import type { Canvas, FabricObject } from 'fabric';
import * as fabric from 'fabric';

/**
 * Добавляет анимацию появления объекта на canvas
 */
export function animateObjectIn(
  canvas: Canvas,
  object: FabricObject,
  duration: number = 300
): void {
  object.set({
    opacity: 0,
    scaleX: 0.8,
    scaleY: 0.8,
  });

  object.animate(
    {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
    },
    {
      duration,
      onChange: () => canvas.renderAll(),
      onComplete: () => canvas.renderAll(),
      easing: fabric.util.ease.easeOutCubic,
    }
  );
}

/**
 * Добавляет анимацию выделения объекта
 */
export function animateSelection(
  canvas: Canvas,
  object: FabricObject,
  duration: number = 200
): void {
  const originalScaleX = object.scaleX || 1;
  const originalScaleY = object.scaleY || 1;

  object.animate(
    {
      scaleX: originalScaleX * 1.05,
      scaleY: originalScaleY * 1.05,
    },
    {
      duration: duration / 2,
      onChange: () => canvas.renderAll(),
      onComplete: () => {
        object.animate(
          {
            scaleX: originalScaleX,
            scaleY: originalScaleY,
          },
          {
            duration: duration / 2,
            onChange: () => canvas.renderAll(),
            onComplete: () => canvas.renderAll(),
            easing: fabric.util.ease.easeOutCubic,
          }
        );
      },
      easing: fabric.util.ease.easeOutCubic,
    }
  );
}

/**
 * Добавляет анимацию удаления объекта
 */
export function animateObjectOut(
  canvas: Canvas,
  object: FabricObject,
  onComplete?: () => void,
  duration: number = 200
): void {
  object.animate(
    {
      opacity: 0,
      scaleX: 0.8,
      scaleY: 0.8,
    },
    {
      duration,
      onChange: () => canvas.renderAll(),
      onComplete: () => {
        canvas.remove(object);
        canvas.renderAll();
        onComplete?.();
      },
      easing: fabric.util.ease.easeInCubic,
    }
  );
}

/**
 * Настраивает улучшенные контролы трансформации для объекта
 */
export function enhanceObjectControls(
  object: FabricObject,
  options?: {
    borderColor?: string;
    cornerColor?: string;
    cornerSize?: number;
    transparentCorners?: boolean;
  }
): void {
  const {
    borderColor = '#3b82f6',
    cornerColor = '#ffffff',
    cornerSize = 12,
    transparentCorners = false,
  } = options || {};

  object.set({
    borderColor,
    cornerColor,
    cornerSize,
    transparentCorners,
    borderScaleFactor: 2,
    cornerStyle: 'circle',
    rotatingPointOffset: 40,
  });

  // Улучшенные контролы с анимацией
  if (object.canvas) {
    object.canvas.on('selection:created', () => {
      if (object.canvas?.getActiveObject() === object) {
        animateSelection(object.canvas!, object, 200);
      }
    });
  }
}

/**
 * Добавляет направляющие при перемещении объекта
 */
export function setupSnapToGrid(
  canvas: Canvas,
  gridSize: number = 20,
  enabled: boolean = true
): void {
  if (!enabled) {
    canvas.off('object:moving');
    return;
  }

  canvas.on('object:moving', (e) => {
    const obj = e.target;
    if (!obj) return;

    const left = Math.round(obj.left! / gridSize) * gridSize;
    const top = Math.round(obj.top! / gridSize) * gridSize;

    obj.set({
      left,
      top,
    });

    canvas.renderAll();
  });
}

/**
 * Настраивает улучшенную визуальную обратную связь для canvas
 */
export function setupCanvasFeedback(canvas: Canvas): void {
  // Анимация при добавлении объекта
  canvas.on('object:added', (e) => {
    const obj = e.target;
    if (obj) {
      animateObjectIn(canvas, obj, 300);
    }
  });

  // Улучшенное выделение
  canvas.on('selection:created', (e) => {
    const obj = e.selected?.[0];
    if (obj) {
      enhanceObjectControls(obj);
    }
  });

  canvas.on('selection:updated', (e) => {
    const obj = e.selected?.[0];
    if (obj) {
      enhanceObjectControls(obj);
    }
  });

  // Плавная анимация при изменении размера
  canvas.on('object:scaling', () => {
    canvas.renderAll();
  });

  // Плавная анимация при повороте
  canvas.on('object:rotating', () => {
    canvas.renderAll();
  });
}

