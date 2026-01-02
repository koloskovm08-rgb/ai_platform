import * as fabric from 'fabric';
import type { Canvas, FabricObject, FabricImage, Rect } from 'fabric';

/**
 * Включить режим обрезки изображения
 */
export function enableImageCrop(canvas: Canvas): Rect | null {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return null;
  }

  const img = activeObject as FabricImage;
  const bounds = img.getBoundingRect();

  // Создаём прямоугольник обрезки
  const cropRect = new fabric.Rect({
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
    fill: 'transparent',
    stroke: '#3b82f6',
    strokeWidth: 2,
    strokeDashArray: [10, 5],
    selectable: true,
    hasControls: true,
    hasBorders: true,
    lockRotation: true,
    cornerColor: '#3b82f6',
    cornerSize: 10,
    transparentCorners: false,
    evented: true,
  });

  canvas.add(cropRect);
  canvas.setActiveObject(cropRect);
  canvas.renderAll();

  return cropRect;
}

/**
 * Применить обрезку изображения
 */
export function applyImageCrop(canvas: Canvas, cropRect: Rect): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return;
  }

  const img = activeObject as FabricImage;
  const cropBounds = cropRect.getBoundingRect();
  const imgBounds = img.getBoundingRect();

  // Вычисляем относительные координаты обрезки
  const cropLeft = cropBounds.left - imgBounds.left;
  const cropTop = cropBounds.top - imgBounds.top;
  const cropWidth = cropBounds.width;
  const cropHeight = cropBounds.height;

  // Создаём временный canvas для обрезки
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = cropWidth;
  tempCanvas.height = cropHeight;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx || !img.getElement()) {
    return;
  }

  // Обрезаем изображение
  tempCtx.drawImage(
    img.getElement() as HTMLImageElement,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  // Создаём новое изображение из обрезанной области
  const croppedDataURL = tempCanvas.toDataURL('image/png');
  
  fabric.FabricImage.fromURL(croppedDataURL, { crossOrigin: 'anonymous' })
    .then((croppedImg) => {
      croppedImg.set({
        left: cropBounds.left,
        top: cropBounds.top,
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        angle: img.angle,
      });

      canvas.remove(img);
      canvas.remove(cropRect);
      canvas.add(croppedImg);
      canvas.setActiveObject(croppedImg);
      canvas.renderAll();
    });
}

/**
 * Применить маску к изображению
 */
export function applyImageMask(
  canvas: Canvas,
  maskType: 'circle' | 'rectangle' | 'rounded'
): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return;
  }

  const img = activeObject as FabricImage;
  const bounds = img.getBoundingRect();

  let mask: fabric.Object;

  switch (maskType) {
    case 'circle':
      mask = new fabric.Circle({
        radius: Math.min(bounds.width, bounds.height) / 2,
        left: bounds.left + bounds.width / 2,
        top: bounds.top + bounds.height / 2,
        originX: 'center',
        originY: 'center',
      });
      break;
    case 'rounded':
      mask = new fabric.Rect({
        width: bounds.width,
        height: bounds.height,
        left: bounds.left,
        top: bounds.top,
        rx: 20,
        ry: 20,
      });
      break;
    default:
      mask = new fabric.Rect({
        width: bounds.width,
        height: bounds.height,
        left: bounds.left,
        top: bounds.top,
      });
  }

  // Применяем маску через clipPath
  img.clipPath = mask;
  canvas.renderAll();
}

/**
 * Удалить маску с изображения
 */
export function removeImageMask(canvas: Canvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return;
  }

  const img = activeObject as FabricImage;
  img.clipPath = undefined;
  canvas.renderAll();
}

/**
 * Применить фильтр к изображению
 */
export function applyImageFilter(
  canvas: Canvas,
  filterType:
    | 'grayscale'
    | 'sepia'
    | 'invert'
    | 'brightness'
    | 'contrast'
    | 'blur'
    | 'saturate'
    | 'hue',
  value?: number
): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return;
  }

  const img = activeObject as FabricImage;
  if (!img.filters) {
    img.filters = [];
  }

  let filter: any = null;

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
      filter = new fabric.filters.Brightness({
        brightness: value !== undefined ? value : 0,
      });
      break;
    case 'contrast':
      filter = new fabric.filters.Contrast({
        contrast: value !== undefined ? value : 0,
      });
      break;
    case 'blur':
      filter = new fabric.filters.Blur({
        blur: value !== undefined ? value : 0,
      });
      break;
    case 'saturate':
      filter = new fabric.filters.Saturation({
        saturation: value !== undefined ? value : 0,
      });
      break;
    case 'hue':
      filter = new fabric.filters.HueRotation({
        rotation: value !== undefined ? value : 0,
      });
      break;
  }

  if (filter) {
    // Удаляем существующий фильтр того же типа, если есть
    img.filters = img.filters.filter(
      (f: any) => f.type !== filterType
    );
    img.filters.push(filter);
    img.applyFilters();
    canvas.renderAll();
  }
}

/**
 * Удалить все фильтры с изображения
 */
export function removeImageFilters(canvas: Canvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return;
  }

  const img = activeObject as FabricImage;
  img.filters = [];
  img.applyFilters();
  canvas.renderAll();
}

/**
 * Применить тень к изображению
 */
export function applyImageShadow(
  canvas: Canvas,
  options?: {
    color?: string;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
  }
): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return;
  }

  const img = activeObject as FabricImage;
  img.set(
    'shadow',
    new fabric.Shadow({
      color: options?.color || 'rgba(0, 0, 0, 0.3)',
      blur: options?.blur || 5,
      offsetX: options?.offsetX || 2,
      offsetY: options?.offsetY || 2,
    })
  );
  canvas.renderAll();
}

/**
 * Удалить тень с изображения
 */
export function removeImageShadow(canvas: Canvas): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return;
  }

  const img = activeObject as FabricImage;
  img.set('shadow', null);
  canvas.renderAll();
}

/**
 * Заменить изображение
 */
export function replaceImage(canvas: Canvas, newImageUrl: string): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return;
  }

  const img = activeObject as FabricImage;
  const currentLeft = img.left;
  const currentTop = img.top;
  const currentScaleX = img.scaleX;
  const currentScaleY = img.scaleY;
  const currentAngle = img.angle;

  fabric.FabricImage.fromURL(newImageUrl, { crossOrigin: 'anonymous' })
    .then((newImg) => {
      newImg.set({
        left: currentLeft,
        top: currentTop,
        scaleX: currentScaleX,
        scaleY: currentScaleY,
        angle: currentAngle,
      });

      canvas.remove(img);
      canvas.add(newImg);
      canvas.setActiveObject(newImg);
      canvas.renderAll();
    });
}

/**
 * Заблокировать/разблокировать пропорции изображения
 */
export function toggleImageAspectRatio(canvas: Canvas, locked: boolean): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'image') {
    return;
  }

  const img = activeObject as FabricImage;
  img.set({
    lockUniScaling: locked,
  });
  canvas.renderAll();
}

