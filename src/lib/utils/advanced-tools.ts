import * as fabric from 'fabric';
import type { Canvas, FabricObject, Point } from 'fabric';

/**
 * Настройка multi-select с улучшенной визуализацией
 */
export function setupMultiSelect(canvas: Canvas) {
  // Включаем множественный выбор
  canvas.selection = true;
  canvas.selectionColor = 'rgba(59, 130, 246, 0.3)';
  canvas.selectionBorderColor = '#3b82f6';
  canvas.selectionLineWidth = 2;

  // Обработчик для визуализации множественного выбора
  canvas.on('selection:created', (e) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 1) {
      // Подсвечиваем все выбранные объекты
      activeObjects.forEach((obj) => {
        obj.set({
          borderColor: '#3b82f6',
          borderScaleFactor: 2,
        });
      });
      canvas.renderAll();
    }
  });

  canvas.on('selection:updated', (e) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 1) {
      activeObjects.forEach((obj) => {
        obj.set({
          borderColor: '#3b82f6',
          borderScaleFactor: 2,
        });
      });
      canvas.renderAll();
    }
  });

  canvas.on('selection:cleared', () => {
    // Сбрасываем подсветку всех объектов
    canvas.getObjects().forEach((obj) => {
      obj.set({
        borderColor: '#3b82f6',
        borderScaleFactor: 1,
      });
    });
    canvas.renderAll();
  });
}

/**
 * Smart Guides - направляющие линии при выравнивании объектов
 */
interface GuideLine {
  x?: number;
  y?: number;
  type: 'horizontal' | 'vertical';
}

let guideLines: GuideLine[] = [];
let guideLineObjects: fabric.Line[] = [];

export function setupSmartGuides(canvas: Canvas, enabled: boolean = true) {
  if (!enabled) {
    clearGuideLines(canvas);
    return;
  }

  canvas.on('object:moving', (e) => {
    const activeObject = e.target as FabricObject;
    if (!activeObject) return;

    const objects = canvas.getObjects().filter((obj) => obj !== activeObject);
    const guides = findGuideLines(activeObject, objects, canvas);
    
    clearGuideLines(canvas);
    drawGuideLines(canvas, guides);
    
    // Применяем привязку к направляющим
    snapToGuides(activeObject, guides);
  });

  canvas.on('object:modified' as any, () => {
    clearGuideLines(canvas);
  });

  canvas.on('object:scaling', (e) => {
    const activeObject = e.target as FabricObject;
    if (!activeObject) return;

    const objects = canvas.getObjects().filter((obj) => obj !== activeObject);
    const guides = findGuideLines(activeObject, objects, canvas);
    
    clearGuideLines(canvas);
    drawGuideLines(canvas, guides);
  });

  canvas.on('object:modified' as any, () => {
    clearGuideLines(canvas);
  });
}

function findGuideLines(
  activeObject: FabricObject,
  otherObjects: FabricObject[],
  canvas: Canvas,
  threshold: number = 5
): GuideLine[] {
  const guides: GuideLine[] = [];
  const activeBounds = activeObject.getBoundingRect();

  otherObjects.forEach((obj) => {
    const objBounds = obj.getBoundingRect();

    // Горизонтальные направляющие
    if (Math.abs(activeBounds.top - objBounds.top) < threshold) {
      guides.push({ y: objBounds.top, type: 'horizontal' });
    }
    const activeBottom = activeBounds.top + activeBounds.height;
    const objBottom = objBounds.top + objBounds.height;
    if (Math.abs(activeBounds.top - objBottom) < threshold) {
      guides.push({ y: objBottom, type: 'horizontal' });
    }
    if (Math.abs(activeBottom - objBounds.top) < threshold) {
      guides.push({ y: objBounds.top, type: 'horizontal' });
    }
    if (Math.abs(activeBottom - objBottom) < threshold) {
      guides.push({ y: objBottom, type: 'horizontal' });
    }
    if (Math.abs(activeBounds.top + activeBounds.height / 2 - (objBounds.top + objBounds.height / 2)) < threshold) {
      guides.push({ y: objBounds.top + objBounds.height / 2, type: 'horizontal' });
    }

    // Вертикальные направляющие
    if (Math.abs(activeBounds.left - objBounds.left) < threshold) {
      guides.push({ x: objBounds.left, type: 'vertical' });
    }
    const activeRight = activeBounds.left + activeBounds.width;
    const objRight = objBounds.left + objBounds.width;
    if (Math.abs(activeBounds.left - objRight) < threshold) {
      guides.push({ x: objRight, type: 'vertical' });
    }
    if (Math.abs(activeRight - objBounds.left) < threshold) {
      guides.push({ x: objBounds.left, type: 'vertical' });
    }
    if (Math.abs(activeRight - objRight) < threshold) {
      guides.push({ x: objRight, type: 'vertical' });
    }
    if (Math.abs(activeBounds.left + activeBounds.width / 2 - (objBounds.left + objBounds.width / 2)) < threshold) {
      guides.push({ x: objBounds.left + objBounds.width / 2, type: 'vertical' });
    }
  });

  // Направляющие по центру canvas
  const center = canvas.getCenter();
  if (Math.abs(activeBounds.left + activeBounds.width / 2 - center.left) < threshold) {
    guides.push({ x: center.left, type: 'vertical' });
  }
  if (Math.abs(activeBounds.top + activeBounds.height / 2 - center.top) < threshold) {
    guides.push({ y: center.top, type: 'horizontal' });
  }

  return guides;
}

function drawGuideLines(canvas: Canvas, guides: GuideLine[]) {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  guides.forEach((guide) => {
    let line: fabric.Line;

    if (guide.type === 'horizontal' && guide.y !== undefined) {
      line = new fabric.Line([0, guide.y, width, guide.y], {
        stroke: '#3b82f6',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
    } else if (guide.type === 'vertical' && guide.x !== undefined) {
      line = new fabric.Line([guide.x, 0, guide.x, height], {
        stroke: '#3b82f6',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
    } else {
      return;
    }

    canvas.add(line);
    canvas.sendObjectToBack(line);
    guideLineObjects.push(line);
  });

  canvas.renderAll();
}

function clearGuideLines(canvas: Canvas) {
  guideLineObjects.forEach((line) => {
    canvas.remove(line);
  });
  guideLineObjects = [];
  guideLines = [];
}

function snapToGuides(activeObject: FabricObject, guides: GuideLine[]) {
  const bounds = activeObject.getBoundingRect();
  const snapThreshold = 5;

  guides.forEach((guide) => {
    if (guide.type === 'horizontal' && guide.y !== undefined) {
      // Привязка по вертикали
      const boundsBottom = bounds.top + bounds.height;
      if (Math.abs(bounds.top - guide.y) < snapThreshold) {
        activeObject.set('top', guide.y);
      } else if (Math.abs(boundsBottom - guide.y) < snapThreshold) {
        activeObject.set('top', guide.y - bounds.height);
      } else if (Math.abs(bounds.top + bounds.height / 2 - guide.y) < snapThreshold) {
        activeObject.set('top', guide.y - bounds.height / 2);
      }
    } else if (guide.type === 'vertical' && guide.x !== undefined) {
      // Привязка по горизонтали
      const boundsRight = bounds.left + bounds.width;
      if (Math.abs(bounds.left - guide.x) < snapThreshold) {
        activeObject.set('left', guide.x);
      } else if (Math.abs(boundsRight - guide.x) < snapThreshold) {
        activeObject.set('left', guide.x - bounds.width);
      } else if (Math.abs(bounds.left + bounds.width / 2 - guide.x) < snapThreshold) {
        activeObject.set('left', guide.x - bounds.width / 2);
      }
    }
  });

  activeObject.setCoords();
}

/**
 * Улучшенный snap-to-grid с визуальной индикацией
 */
export function setupEnhancedSnapToGrid(
  canvas: Canvas,
  gridSize: number = 20,
  enabled: boolean = true,
  showGrid: boolean = false
) {
  if (!enabled) {
    hideGrid(canvas);
    return;
  }

  // Показываем сетку, если нужно
  if (showGrid) {
    drawGrid(canvas, gridSize);
  } else {
    hideGrid(canvas);
  }

  // Привязка при перемещении
  canvas.on('object:moving', (e) => {
    const obj = e.target as FabricObject;
    if (!obj) return;

    const left = Math.round((obj.left || 0) / gridSize) * gridSize;
    const top = Math.round((obj.top || 0) / gridSize) * gridSize;

    obj.set({
      left,
      top,
    });
    obj.setCoords();
  });

  // Привязка при изменении размера
  canvas.on('object:scaling', (e) => {
    const obj = e.target as FabricObject;
    if (!obj) return;

    const width = Math.round((obj.width || 0) * (obj.scaleX || 1) / gridSize) * gridSize;
    const height = Math.round((obj.height || 0) * (obj.scaleY || 1) / gridSize) * gridSize;

    if (width > 0 && height > 0) {
      obj.set({
        scaleX: width / (obj.width || 1),
        scaleY: height / (obj.height || 1),
      });
      obj.setCoords();
    }
  });
}

let gridObjects: fabric.Line[] = [];

function drawGrid(canvas: Canvas, gridSize: number) {
  hideGrid(canvas);

  const width = canvas.getWidth();
  const height = canvas.getHeight();

  // Вертикальные линии
  for (let x = 0; x <= width; x += gridSize) {
    const line = new fabric.Line([x, 0, x, height], {
      stroke: 'rgba(255, 255, 255, 0.1)',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    canvas.add(line);
    canvas.sendObjectToBack(line);
    gridObjects.push(line);
  }

  // Горизонтальные линии
  for (let y = 0; y <= height; y += gridSize) {
    const line = new fabric.Line([0, y, width, y], {
      stroke: 'rgba(255, 255, 255, 0.1)',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    canvas.add(line);
    canvas.sendObjectToBack(line);
    gridObjects.push(line);
  }

  canvas.renderAll();
}

function hideGrid(canvas: Canvas) {
  gridObjects.forEach((line) => {
    canvas.remove(line);
  });
  gridObjects = [];
}

/**
 * Расширенный bounding box с дополнительными контролами
 */
export function setupEnhancedBoundingBox(canvas: Canvas) {
  // Улучшенные контролы для всех объектов
  canvas.on('object:added', (e) => {
    const obj = e.target as FabricObject;
    if (obj) {
      enhanceBoundingBox(obj);
    }
  });

  canvas.on('selection:created', (e) => {
    const obj = e.selected?.[0] as FabricObject;
    if (obj) {
      enhanceBoundingBox(obj);
    }
  });

  canvas.on('selection:updated', (e) => {
    const obj = e.selected?.[0] as FabricObject;
    if (obj) {
      enhanceBoundingBox(obj);
    }
  });
}

function enhanceBoundingBox(obj: FabricObject) {
  obj.set({
    borderColor: '#3b82f6',
    cornerColor: '#ffffff',
    cornerSize: 12,
    cornerStyle: 'circle',
    transparentCorners: false,
    borderScaleFactor: 2,
    rotatingPointOffset: 40,
    // Дополнительные контролы для skew
    hasControls: true,
    hasBorders: true,
    lockRotation: false,
    lockScalingX: false,
    lockScalingY: false,
    lockSkewingX: false,
    lockSkewingY: false,
  });
}

/**
 * Включить/выключить smart guides
 */
export function toggleSmartGuides(canvas: Canvas, enabled: boolean) {
  setupSmartGuides(canvas, enabled);
}

/**
 * Включить/выключить snap-to-grid
 */
export function toggleSnapToGrid(
  canvas: Canvas,
  enabled: boolean,
  gridSize: number = 20,
  showGrid: boolean = false
) {
  setupEnhancedSnapToGrid(canvas, gridSize, enabled, showGrid);
}

