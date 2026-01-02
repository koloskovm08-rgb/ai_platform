import type { Canvas } from 'fabric';

/**
 * Оптимизация рендеринга canvas с debounce
 */
export function debounceRender(canvas: Canvas, delay: number = 100) {
  let timeoutId: NodeJS.Timeout | null = null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      canvas.renderAll();
      timeoutId = null;
    }, delay);
  };
}

/**
 * Оптимизация событий canvas - группировка изменений
 */
export function optimizeCanvasEvents(canvas: Canvas) {
  const renderQueue: (() => void)[] = [];
  let isRendering = false;

  const flushRender = () => {
    if (isRendering || renderQueue.length === 0) return;

    isRendering = true;
    requestAnimationFrame(() => {
      renderQueue.forEach((fn) => fn());
      renderQueue.length = 0;
      canvas.renderAll();
      isRendering = false;
    });
  };

  // Оптимизируем события изменения объектов
  const originalRenderAll = canvas.renderAll.bind(canvas);
  canvas.renderAll = () => {
    renderQueue.push(() => {});
    flushRender();
  };

  // Оптимизируем события перемещения
  canvas.on('object:moving', () => {
    renderQueue.push(() => {});
    flushRender();
  });

  canvas.on('object:scaling', () => {
    renderQueue.push(() => {});
    flushRender();
  });

  canvas.on('object:rotating', () => {
    renderQueue.push(() => {});
    flushRender();
  });

  return () => {
    canvas.renderAll = originalRenderAll;
    canvas.off('object:moving');
    canvas.off('object:scaling');
    canvas.off('object:rotating');
  };
}

/**
 * Включает режим производительности для canvas
 */
export function enablePerformanceMode(canvas: Canvas) {
  // Отключаем некоторые визуальные эффекты для производительности
  canvas.renderOnAddRemove = false;
  canvas.skipOffscreen = true;

  // Оптимизируем рендеринг
  const debouncedRender = debounceRender(canvas, 50);
  const cleanup = optimizeCanvasEvents(canvas);

  return () => {
    canvas.renderOnAddRemove = true;
    canvas.skipOffscreen = false;
    cleanup();
  };
}

