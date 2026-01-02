import type { Canvas } from 'fabric';

/**
 * Выравнивание объектов относительно canvas
 */
export function alignObjects(
  canvas: Canvas,
  align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): void {
  try {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const canvasWidth = canvas.width || 0;
    const canvasHeight = canvas.height || 0;

    switch (align) {
      case 'left':
        activeObject.set({ left: 0, originX: 'left' });
        break;
      case 'center':
        activeObject.set({ left: canvasWidth / 2, originX: 'center' });
        break;
      case 'right':
        activeObject.set({ left: canvasWidth, originX: 'right' });
        break;
      case 'top':
        activeObject.set({ top: 0, originY: 'top' });
        break;
      case 'middle':
        activeObject.set({ top: canvasHeight / 2, originY: 'center' });
        break;
      case 'bottom':
        activeObject.set({ top: canvasHeight, originY: 'bottom' });
        break;
    }

    canvas.renderAll();
  } catch (error) {
    console.warn('Ошибка при выравнивании объектов:', error);
  }
}

/**
 * Выравнивание группы объектов относительно друг друга
 */
export function alignSelectedObjects(
  canvas: Canvas,
  align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): void {
  try {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;
    
    if (activeObjects.length === 1) {
      // Если один объект, выравниваем относительно canvas
      alignObjects(canvas, align);
      return;
    }

    // Вычисляем границы всех выбранных объектов вручную
    let minLeft = Infinity;
    let maxRight = -Infinity;
    let minTop = Infinity;
    let maxBottom = -Infinity;

    activeObjects.forEach((obj) => {
      const boundingRect = obj.getBoundingRect();
      minLeft = Math.min(minLeft, boundingRect.left);
      maxRight = Math.max(maxRight, boundingRect.left + boundingRect.width);
      minTop = Math.min(minTop, boundingRect.top);
      maxBottom = Math.max(maxBottom, boundingRect.top + boundingRect.height);
    });

    const groupWidth = maxRight - minLeft;
    const groupHeight = maxBottom - minTop;

    // Выравниваем каждый объект
    activeObjects.forEach((obj) => {
      const objBoundingRect = obj.getBoundingRect();
      
      switch (align) {
        case 'left':
          obj.set({ left: minLeft });
          break;
        case 'center':
          obj.set({ left: minLeft + groupWidth / 2 - objBoundingRect.width / 2 });
          break;
        case 'right':
          obj.set({ left: minLeft + groupWidth - objBoundingRect.width });
          break;
        case 'top':
          obj.set({ top: minTop });
          break;
        case 'middle':
          obj.set({ top: minTop + groupHeight / 2 - objBoundingRect.height / 2 });
          break;
        case 'bottom':
          obj.set({ top: minTop + groupHeight - objBoundingRect.height });
          break;
      }
    });

    canvas.renderAll();
  } catch (error) {
    console.warn('Ошибка при выравнивании группы объектов:', error);
  }
}

/**
 * Распределение объектов с равными промежутками
 */
export function distributeObjects(
  canvas: Canvas,
  direction: 'horizontal' | 'vertical'
): void {
  try {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 3) return; // Нужно минимум 3 объекта

    // Сортируем объекты по позиции
    const sortedObjects = [...activeObjects].sort((a, b) => {
      const aRect = a.getBoundingRect();
      const bRect = b.getBoundingRect();
      if (direction === 'horizontal') {
        return aRect.left - bRect.left;
      } else {
        return aRect.top - bRect.top;
      }
    });

    if (direction === 'horizontal') {
      // Получаем границы первого и последнего объекта
      const firstRect = sortedObjects[0].getBoundingRect();
      const lastRect = sortedObjects[sortedObjects.length - 1].getBoundingRect();
      const firstLeft = firstRect.left;
      const lastRight = lastRect.left + lastRect.width;
      
      // Вычисляем общую ширину всех объектов (кроме первого и последнего)
      const totalWidth = sortedObjects.reduce((sum, obj) => sum + obj.getBoundingRect().width, 0);
      const totalSpace = lastRight - firstLeft;
      const spaceBetween = (totalSpace - totalWidth) / (sortedObjects.length - 1);

      let currentX = firstLeft;
      sortedObjects.forEach((obj) => {
        const objRect = obj.getBoundingRect();
        obj.set({ left: currentX });
        currentX += objRect.width + spaceBetween;
      });
    } else {
      // Вертикальное распределение
      const firstRect = sortedObjects[0].getBoundingRect();
      const lastRect = sortedObjects[sortedObjects.length - 1].getBoundingRect();
      const firstTop = firstRect.top;
      const lastBottom = lastRect.top + lastRect.height;
      
      const totalHeight = sortedObjects.reduce((sum, obj) => sum + obj.getBoundingRect().height, 0);
      const totalSpace = lastBottom - firstTop;
      const spaceBetween = (totalSpace - totalHeight) / (sortedObjects.length - 1);

      let currentY = firstTop;
      sortedObjects.forEach((obj) => {
        const objRect = obj.getBoundingRect();
        obj.set({ top: currentY });
        currentY += objRect.height + spaceBetween;
      });
    }

    canvas.renderAll();
  } catch (error) {
    console.warn('Ошибка при распределении объектов:', error);
  }
}

/**
 * Выравнивание объектов по центру группы
 */
export function centerObjects(canvas: Canvas): void {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 2) return;

  // Вычисляем границы вручную
  let minLeft = Infinity;
  let maxRight = -Infinity;
  let minTop = Infinity;
  let maxBottom = -Infinity;

  activeObjects.forEach((obj) => {
    const boundingRect = obj.getBoundingRect();
    minLeft = Math.min(minLeft, boundingRect.left);
    maxRight = Math.max(maxRight, boundingRect.left + boundingRect.width);
    minTop = Math.min(minTop, boundingRect.top);
    maxBottom = Math.max(maxBottom, boundingRect.top + boundingRect.height);
  });

  const centerX = (minLeft + maxRight) / 2;
  const centerY = (minTop + maxBottom) / 2;

  activeObjects.forEach((obj) => {
    const objBoundingRect = obj.getBoundingRect();
    obj.set({
      left: centerX - objBoundingRect.width / 2,
      top: centerY - objBoundingRect.height / 2,
    });
  });

  canvas.renderAll();
}

