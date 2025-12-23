import * as fabric from 'fabric';
import { saveAs } from 'file-saver';

/**
 * Загрузить изображение на canvas
 */
export function loadImageToCanvas(
  canvas: fabric.Canvas,
  imageUrl: string,
  callback?: () => void
) {
  fabric.Image.fromURL(
    imageUrl,
    (img) => {
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

      canvas.setBackgroundImage(img, () => {
        canvas.renderAll();
        callback?.();
      });
    },
    { crossOrigin: 'anonymous' }
  );
}

/**
 * Добавить текст на canvas
 */
export function addText(canvas: fabric.Canvas, text: string = 'Текст') {
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
export function addRectangle(canvas: fabric.Canvas) {
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
export function addCircle(canvas: fabric.Canvas) {
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
export function addTriangle(canvas: fabric.Canvas) {
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
export function deleteSelected(canvas: fabric.Canvas) {
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
  canvas: fabric.Canvas,
  filterType: string,
  value?: number
) {
  const bgImage = canvas.backgroundImage as fabric.Image;
  if (!bgImage) return;

  let filter: fabric.IBaseFilter | null = null;

  switch (filterType) {
    case 'grayscale':
      filter = new fabric.Image.filters.Grayscale();
      break;
    case 'sepia':
      filter = new fabric.Image.filters.Sepia();
      break;
    case 'invert':
      filter = new fabric.Image.filters.Invert();
      break;
    case 'brightness':
      filter = new fabric.Image.filters.Brightness({ brightness: value || 0 });
      break;
    case 'contrast':
      filter = new fabric.Image.filters.Contrast({ contrast: value || 0 });
      break;
    case 'blur':
      filter = new fabric.Image.filters.Blur({ blur: value || 0 });
      break;
    case 'pixelate':
      filter = new fabric.Image.filters.Pixelate({ blocksize: value || 4 });
      break;
    default:
      break;
  }

  if (filter) {
    bgImage.filters = [filter];
    bgImage.applyFilters();
    canvas.renderAll();
  }
}

/**
 * Сбросить все фильтры
 */
export function clearFilters(canvas: fabric.Canvas) {
  const bgImage = canvas.backgroundImage as fabric.Image;
  if (!bgImage) return;

  bgImage.filters = [];
  bgImage.applyFilters();
  canvas.renderAll();
}

/**
 * Повернуть canvas на 90 градусов
 */
export function rotateCanvas(canvas: fabric.Canvas, angle: number = 90) {
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
export function flipHorizontal(canvas: fabric.Canvas) {
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
  canvas: fabric.Canvas,
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
    });

    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Получить JSON представление canvas
 */
export function exportAsJSON(canvas: fabric.Canvas) {
  return JSON.stringify(canvas.toJSON());
}

/**
 * Загрузить canvas из JSON
 */
export function loadFromJSON(canvas: fabric.Canvas, json: string) {
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
export function enableCropMode(canvas: fabric.Canvas): fabric.Rect {
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
export function applyCrop(canvas: fabric.Canvas, cropRect: fabric.Rect) {
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
  const img = new Image();
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
export function cancelCrop(canvas: fabric.Canvas, cropRect: fabric.Rect) {
  if (cropRect) {
    canvas.remove(cropRect);
    canvas.renderAll();
  }
}

/**
 * Включить режим свободного рисования (кисть)
 */
export function enableDrawingMode(
  canvas: fabric.Canvas,
  options?: {
    color?: string;
    width?: number;
  }
) {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = options?.color || '#000000';
  canvas.freeDrawingBrush.width = options?.width || 5;
}

/**
 * Выключить режим рисования
 */
export function disableDrawingMode(canvas: fabric.Canvas) {
  canvas.isDrawingMode = false;
}

/**
 * Изменить параметры кисти
 */
export function setBrushSettings(
  canvas: fabric.Canvas,
  color?: string,
  width?: number
) {
  if (color) {
    canvas.freeDrawingBrush.color = color;
  }
  if (width !== undefined) {
    canvas.freeDrawingBrush.width = width;
  }
}

/**
 * Добавить прямоугольник с градиентом
 */
export function addRectangleWithGradient(
  canvas: fabric.Canvas,
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
  canvas: fabric.Canvas,
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
export function getLayers(canvas: fabric.Canvas) {
  return canvas.getObjects().map((obj, index) => ({
    id: index,
    type: obj.type,
    visible: obj.visible !== false,
    name: `Слой ${index + 1}`,
    object: obj,
  }));
}

/**
 * Переместить слой вверх
 */
export function moveLayerUp(canvas: fabric.Canvas, obj: fabric.Object) {
  canvas.bringForward(obj);
  canvas.renderAll();
}

/**
 * Переместить слой вниз
 */
export function moveLayerDown(canvas: fabric.Canvas, obj: fabric.Object) {
  canvas.sendBackwards(obj);
  canvas.renderAll();
}

/**
 * Переместить слой наверх (на передний план)
 */
export function moveLayerToTop(canvas: fabric.Canvas, obj: fabric.Object) {
  canvas.bringToFront(obj);
  canvas.renderAll();
}

/**
 * Переместить слой вниз (на задний план)
 */
export function moveLayerToBottom(canvas: fabric.Canvas, obj: fabric.Object) {
  canvas.sendToBack(obj);
  canvas.renderAll();
}

/**
 * Показать/скрыть слой
 */
export function toggleLayerVisibility(canvas: fabric.Canvas, obj: fabric.Object) {
  obj.visible = !obj.visible;
  canvas.renderAll();
}

/**
 * Удалить слой
 */
export function deleteLayer(canvas: fabric.Canvas, obj: fabric.Object) {
  canvas.remove(obj);
  canvas.renderAll();
}

/**
 * Выбрать слой
 */
export function selectLayer(canvas: fabric.Canvas, obj: fabric.Object) {
  canvas.setActiveObject(obj);
  canvas.renderAll();
}

