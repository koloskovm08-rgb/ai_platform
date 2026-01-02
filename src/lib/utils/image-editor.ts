import * as fabric from 'fabric';
import type { Canvas, Rect, FabricObject, FabricImage } from 'fabric';
import { saveAs } from 'file-saver';
import { safeRemoveChild } from '@/lib/utils';

/**
 * Загрузить изображение на canvas
 */
export function loadImageToCanvas(
  canvas: Canvas,
  imageUrl: string,
  callback?: () => void
) {
  fabric.FabricImage.fromURL(
    imageUrl,
    { crossOrigin: 'anonymous' }
  ).then((img) => {
    // Масштабировать изображение под размер canvas
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const imgWidth = img.width || 0;
    const imgHeight = img.height || 0;

    const scaleX = canvasWidth / imgWidth;
    const scaleY = canvasHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY);

    img.scale(scale);
    img.set({
      left: (canvasWidth - imgWidth * scale) / 2,
      top: (canvasHeight - imgHeight * scale) / 2,
      selectable: false,
    });

    canvas.backgroundImage = img;
    canvas.renderAll();
    callback?.();
  });
}

/**
 * Добавить текст на canvas
 */
export function addText(canvas: Canvas, text: string = 'Текст') {
  const textObject = new fabric.IText(text, {
    left: 100,
    top: 100,
    fontFamily: 'Arial',
    fontSize: 40,
    fill: '#000000',
  });

  canvas.add(textObject);
  canvas.setActiveObject(textObject);
  canvas.renderAll();
}

/**
 * Добавить прямоугольник
 */
export function addRectangle(canvas: Canvas) {
  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 200,
    height: 150,
    fill: 'rgba(59, 130, 246, 0.5)',
    stroke: '#3b82f6',
    strokeWidth: 2,
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();
}

/**
 * Добавить круг
 */
export function addCircle(canvas: Canvas) {
  const circle = new fabric.Circle({
    left: 100,
    top: 100,
    radius: 75,
    fill: 'rgba(236, 72, 153, 0.5)',
    stroke: '#ec4899',
    strokeWidth: 2,
  });

  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.renderAll();
}

/**
 * Добавить треугольник
 */
export function addTriangle(canvas: Canvas) {
  const triangle = new fabric.Triangle({
    left: 100,
    top: 100,
    width: 150,
    height: 150,
    fill: 'rgba(34, 197, 94, 0.5)',
    stroke: '#22c55e',
    strokeWidth: 2,
  });

  canvas.add(triangle);
  canvas.setActiveObject(triangle);
  canvas.renderAll();
}

/**
 * Удалить выбранный объект
 */
export function deleteSelected(canvas: Canvas) {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length) {
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.renderAll();
  }
}

/**
 * Применить фильтр к изображению
 */
export function applyFilter(
  canvas: Canvas,
  filterType: string,
  value?: number
) {
  const bgImage = canvas.backgroundImage as FabricImage;
  if (!bgImage) return;

  // Тип для фильтров fabric.js - используем InstanceType для получения типа экземпляра
  type FabricFilter = 
    | InstanceType<typeof fabric.filters.Grayscale>
    | InstanceType<typeof fabric.filters.Sepia>
    | InstanceType<typeof fabric.filters.Invert>
    | InstanceType<typeof fabric.filters.Brightness>
    | InstanceType<typeof fabric.filters.Contrast>
    | InstanceType<typeof fabric.filters.Blur>
    | InstanceType<typeof fabric.filters.Pixelate>;
  
  let filter: FabricFilter | null = null;

  switch (filterType) {
    case 'grayscale':
      filter = new fabric.filters.Grayscale();
      break;
    case 'sepia':
      filter = new fabric.filters.Sepia();
      break;
    case 'invert':
      filter = new fabric.filters.Invert();
      break;
    case 'brightness':
      filter = new fabric.filters.Brightness({ brightness: value || 0 });
      break;
    case 'contrast':
      filter = new fabric.filters.Contrast({ contrast: value || 0 });
      break;
    case 'blur':
      filter = new fabric.filters.Blur({ blur: value || 0 });
      break;
    case 'pixelate':
      filter = new fabric.filters.Pixelate({ blocksize: value || 4 });
      break;
    default:
      break;
  }

  if (filter && bgImage.filters) {
    bgImage.filters = [filter];
    bgImage.applyFilters();
    canvas.renderAll();
  }
}

/**
 * Сбросить все фильтры
 */
export function clearFilters(canvas: Canvas) {
  const bgImage = canvas.backgroundImage as FabricImage;
  if (!bgImage || !bgImage.filters) return;

  bgImage.filters = [];
  bgImage.applyFilters();
  canvas.renderAll();
}

/**
 * Повернуть canvas на 90 градусов
 */
export function rotateCanvas(canvas: Canvas, angle: number = 90) {
  const objects = canvas.getObjects();
  const center = canvas.getCenter();

  objects.forEach((obj) => {
    const objCenter = obj.getCenterPoint();
    const radians = fabric.util.degreesToRadians(angle);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const newLeft =
      cos * (objCenter.x - center.left) -
      sin * (objCenter.y - center.top) +
      center.left;
    const newTop =
      sin * (objCenter.x - center.left) +
      cos * (objCenter.y - center.top) +
      center.top;

    obj.set({
      left: newLeft,
      top: newTop,
      angle: (obj.angle || 0) + angle,
    });

    obj.setCoords();
  });

  canvas.renderAll();
}

/**
 * Отразить canvas по горизонтали
 */
export function flipHorizontal(canvas: Canvas) {
  const objects = canvas.getObjects();
  const center = canvas.getCenter();

  objects.forEach((obj) => {
    obj.set({
      flipX: !obj.flipX,
      left: center.left - (obj.left || 0) + center.left,
    });
    obj.setCoords();
  });

  canvas.renderAll();
}

/**
 * Экспортировать canvas как изображение
 */
export function exportAsImage(
  canvas: Canvas,
  format: 'png' | 'jpeg' | 'svg' = 'png',
  filename: string = 'image'
) {
  if (format === 'svg') {
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    saveAs(blob, `${filename}.svg`);
  } else {
    const dataURL = canvas.toDataURL({
      format,
      quality: 0.9,
      multiplier: 1,
    });

    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    // Используем безопасное удаление, чтобы избежать ошибок при race conditions
    safeRemoveChild(document.body, link);
  }
}

/**
 * Получить JSON представление canvas
 */
export function exportAsJSON(canvas: Canvas) {
  return JSON.stringify(canvas.toJSON());
}

/**
 * Загрузить canvas из JSON
 */
export function loadFromJSON(canvas: Canvas, json: string) {
  canvas.loadFromJSON(json, () => {
    canvas.renderAll();
  });
}

// ============================================
// НОВЫЕ ФУНКЦИИ - ФАЗА 2
// ============================================

/**
 * Включить режим обрезки (crop)
 * Создаёт выделяемую область для обрезки
 */
export function enableCropMode(canvas: Canvas): Rect {
  // Создаём полупрозрачный прямоугольник для выделения области
  const cropRect = new fabric.Rect({
    left: 50,
    top: 50,
    width: canvas.getWidth() - 100,
    height: canvas.getHeight() - 100,
    fill: 'transparent',
    stroke: '#3b82f6',
    strokeWidth: 3,
    strokeDashArray: [10, 5],
    selectable: true,
    hasControls: true,
    hasBorders: true,
    lockRotation: true,
    cornerColor: '#3b82f6',
    cornerSize: 10,
    transparentCorners: false,
  });

  canvas.add(cropRect);
  canvas.setActiveObject(cropRect);
  canvas.renderAll();

  return cropRect;
}

/**
 * Применить обрезку
 */
export function applyCrop(canvas: Canvas, cropRect: Rect) {
  if (!cropRect) return;

  const left = cropRect.left || 0;
  const top = cropRect.top || 0;
  const width = (cropRect.width || 0) * (cropRect.scaleX || 1);
  const height = (cropRect.height || 0) * (cropRect.scaleY || 1);

  // Создаём временный canvas для обрезки
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) return;

  // Копируем обрезанную область
  const dataURL = canvas.toDataURL();
  const img = new window.Image();
  img.onload = () => {
    tempCtx.drawImage(img, left, top, width, height, 0, 0, width, height);
    const croppedDataURL = tempCanvas.toDataURL();

    // Очищаем canvas и загружаем обрезанное изображение
    canvas.clear();
    canvas.setWidth(width);
    canvas.setHeight(height);
    loadImageToCanvas(canvas, croppedDataURL);
  };
  img.src = dataURL;

  // Удаляем прямоугольник обрезки
  canvas.remove(cropRect);
}

/**
 * Отменить режим обрезки
 */
export function cancelCrop(canvas: Canvas, cropRect: Rect) {
  if (cropRect) {
    canvas.remove(cropRect);
    canvas.renderAll();
  }
}

/**
 * Включить режим свободного рисования (кисть)
 */
export function enableDrawingMode(
  canvas: Canvas,
  options?: {
    color?: string;
    width?: number;
  }
) {
  canvas.isDrawingMode = true;
  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = options?.color || '#000000';
    canvas.freeDrawingBrush.width = options?.width || 5;
  }
}

/**
 * Выключить режим рисования
 */
export function disableDrawingMode(canvas: Canvas) {
  canvas.isDrawingMode = false;
}

/**
 * Изменить параметры кисти
 */
export function setBrushSettings(
  canvas: Canvas,
  color?: string,
  width?: number
) {
  if (canvas.freeDrawingBrush) {
    if (color) {
      canvas.freeDrawingBrush.color = color;
    }
    if (width !== undefined) {
      canvas.freeDrawingBrush.width = width;
    }
  }
}

/**
 * Добавить прямоугольник с градиентом
 */
export function addRectangleWithGradient(
  canvas: Canvas,
  colorStart: string = '#3b82f6',
  colorEnd: string = '#8b5cf6'
) {
  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 200,
    height: 150,
    fill: new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 200, y2: 150 },
      colorStops: [
        { offset: 0, color: colorStart },
        { offset: 1, color: colorEnd },
      ],
    }),
    stroke: colorStart,
    strokeWidth: 2,
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();
}

/**
 * Добавить круг с градиентом
 */
export function addCircleWithGradient(
  canvas: Canvas,
  colorStart: string = '#ec4899',
  colorEnd: string = '#f97316'
) {
  const circle = new fabric.Circle({
    left: 100,
    top: 100,
    radius: 75,
    fill: new fabric.Gradient({
      type: 'radial',
      coords: { x1: 75, y1: 75, x2: 75, y2: 75, r1: 0, r2: 75 },
      colorStops: [
        { offset: 0, color: colorStart },
        { offset: 1, color: colorEnd },
      ],
    }),
    stroke: colorStart,
    strokeWidth: 2,
  });

  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.renderAll();
}

/**
 * Получить список всех объектов (слоёв) на canvas
 */
export function getLayers(canvas: Canvas) {
  return canvas.getObjects().map((obj, index) => {
    // Получаем имя из объекта, если оно есть, иначе используем дефолтное
    const name = (obj as FabricObject & { name?: string }).name || `Слой ${index + 1}`;
    // Проверяем, заблокирован ли объект
    const locked = obj.selectable === false || obj.evented === false;
    return {
      id: index,
      type: obj.type,
      visible: obj.visible !== false,
      name,
      object: obj,
      locked,
    };
  });
}

/**
 * Переместить слой вверх
 */
export function moveLayerUp(canvas: Canvas, obj: FabricObject) {
  canvas.bringObjectForward(obj);
  canvas.renderAll();
}

/**
 * Переместить слой вниз
 */
export function moveLayerDown(canvas: Canvas, obj: FabricObject) {
  canvas.sendObjectBackwards(obj);
  canvas.renderAll();
}

/**
 * Переместить слой наверх (на передний план)
 */
export function moveLayerToTop(canvas: Canvas, obj: FabricObject) {
  canvas.bringObjectToFront(obj);
  canvas.renderAll();
}

/**
 * Переместить слой вниз (на задний план)
 */
export function moveLayerToBottom(canvas: Canvas, obj: FabricObject) {
  canvas.sendObjectToBack(obj);
  canvas.renderAll();
}

/**
 * Показать/скрыть слой
 */
export function toggleLayerVisibility(canvas: Canvas, obj: FabricObject) {
  obj.visible = !obj.visible;
  canvas.renderAll();
}

/**
 * Удалить слой
 */
export function deleteLayer(canvas: Canvas, obj: FabricObject) {
  canvas.remove(obj);
  canvas.renderAll();
}

/**
 * Выбрать слой
 */
export function selectLayer(canvas: Canvas, obj: FabricObject) {
  canvas.setActiveObject(obj);
  canvas.renderAll();
}

/**
 * Добавить штамп (изображение) на canvas
 */
export function addStamp(
  canvas: Canvas,
  imageUrl: string,
  options?: {
    left?: number;
    top?: number;
    scale?: number;
  }
) {
  fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then(
    (img) => {
      const scale = options?.scale || 0.5;
      img.scale(scale);
      img.set({
        left: options?.left || 100,
        top: options?.top || 100,
        selectable: true,
        hasControls: true,
        hasBorders: true,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }
  );
}

/**
 * Переименовать слой (объект)
 */
export function renameLayer(obj: FabricObject, name: string) {
  // Сохраняем имя в данных объекта
  obj.set('name', name);
}

/**
 * Заблокировать/разблокировать слой
 */
export function toggleLayerLock(canvas: Canvas, obj: FabricObject) {
  obj.selectable = !obj.selectable;
  obj.evented = !obj.evented;
  canvas.renderAll();
}

/**
 * Создать группу из выбранных объектов
 */
export function groupSelected(canvas: Canvas) {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;

  const group = new fabric.Group(activeObjects, {
    left: canvas.getCenter().left,
    top: canvas.getCenter().top,
  });

  canvas.remove(...activeObjects);
  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.renderAll();
}

/**
 * Разгруппировать выбранную группу
 */
export function ungroupSelected(canvas: Canvas) {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'group') return;

  const group = activeObject as fabric.Group;
  const objects = group.getObjects();

  canvas.remove(group);
  objects.forEach((obj) => {
    obj.setCoords();
    canvas.add(obj);
  });

  canvas.renderAll();
}

