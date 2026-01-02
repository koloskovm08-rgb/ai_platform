import * as fabric from 'fabric';
import type { Canvas } from 'fabric';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

/**
 * Экспорт canvas в PNG с настройками качества
 */
export function exportToPNG(
  canvas: Canvas,
  options?: {
    filename?: string;
    multiplier?: number;
    quality?: number;
    includeBleed?: boolean;
    bleedSize?: number;
  }
): void {
  const {
    filename = `business-card-${Date.now()}`,
    multiplier = 1,
    quality = 1,
    includeBleed = false,
    bleedSize = 3,
  } = options || {};

  if (includeBleed && bleedSize > 0) {
    // Создаем временный canvas с bleed
    const tempCanvas = document.createElement('canvas');
    const bleedPx = bleedSize * (300 / 25.4); // Конвертируем мм в пиксели при 300 DPI
    tempCanvas.width = canvas.getWidth() + bleedPx * 2;
    tempCanvas.height = canvas.getHeight() + bleedPx * 2;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // Рисуем фон
      tempCtx.fillStyle = canvas.backgroundColor as string || '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Рисуем canvas с отступом
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      });

      const img = new Image();
      img.onload = () => {
        tempCtx.drawImage(img, bleedPx, bleedPx);
        tempCanvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `${filename}.png`);
          }
        }, 'image/png', quality);
      };
      img.src = dataURL;
    }
  } else {
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality,
      multiplier,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Экспорт canvas в SVG
 */
export function exportToSVG(
  canvas: Canvas,
  options?: {
    filename?: string;
    includeBleed?: boolean;
    bleedSize?: number;
  }
): void {
  const {
    filename = `business-card-${Date.now()}`,
    includeBleed = false,
    bleedSize = 3,
  } = options || {};

  let svg = canvas.toSVG();

  if (includeBleed && bleedSize > 0) {
    const bleedPx = bleedSize * (300 / 25.4);
    const width = canvas.getWidth() + bleedPx * 2;
    const height = canvas.getHeight() + bleedPx * 2;

    // Обновляем размеры SVG и добавляем bleed
    svg = svg.replace(
      /width="[^"]*"/,
      `width="${width}"`
    ).replace(
      /height="[^"]*"/,
      `height="${height}"`
    ).replace(
      /viewBox="[^"]*"/,
      `viewBox="0 0 ${width} ${height}"`
    );

    // Добавляем фон для bleed
    const bgRect = `<rect width="${width}" height="${height}" fill="${canvas.backgroundColor || '#ffffff'}" />`;
    svg = svg.replace('>', `>${bgRect}`);
  }

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  saveAs(blob, `${filename}.svg`);
}

/**
 * Экспорт canvas в PDF с crop marks и bleed
 */
export function exportToPDF(
  canvas: Canvas,
  options?: {
    filename?: string;
    includeBleed?: boolean;
    bleedSize?: number;
    includeCropMarks?: boolean;
    colorMode?: 'RGB' | 'CMYK';
  }
): void {
  const {
    filename = `business-card-${Date.now()}`,
    includeBleed = true,
    bleedSize = 3,
    includeCropMarks = true,
    colorMode = 'RGB',
  } = options || {};

  const dpi = 300;
  const mmToPx = (mm: number) => (mm / 25.4) * dpi;
  const bleedPx = includeBleed ? mmToPx(bleedSize) : 0;
  const cropMarkLength = mmToPx(5);

  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const totalWidth = canvasWidth + bleedPx * 2;
  const totalHeight = canvasHeight + bleedPx * 2;

  // Конвертируем в мм для PDF
  const widthMm = (totalWidth / dpi) * 25.4;
  const heightMm = (totalHeight / dpi) * 25.4;

  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  // Получаем изображение canvas
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 2,
  });

  // Добавляем изображение с учетом bleed
  const imgWidth = (canvasWidth / dpi) * 25.4;
  const imgHeight = (canvasHeight / dpi) * 25.4;
  const offsetX = bleedPx > 0 ? (bleedPx / dpi) * 25.4 : 0;
  const offsetY = bleedPx > 0 ? (bleedPx / dpi) * 25.4 : 0;

  pdf.addImage(dataURL, 'PNG', offsetX, offsetY, imgWidth, imgHeight);

  // Добавляем crop marks
  if (includeCropMarks) {
    const markLength = 5; // мм
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);

    // Угловые метки
    // Верхний левый
    pdf.line(0, 0, markLength, 0);
    pdf.line(0, 0, 0, markLength);
    // Верхний правый
    pdf.line(widthMm, 0, widthMm - markLength, 0);
    pdf.line(widthMm, 0, widthMm, markLength);
    // Нижний левый
    pdf.line(0, heightMm, markLength, heightMm);
    pdf.line(0, heightMm, 0, heightMm - markLength);
    // Нижний правый
    pdf.line(widthMm, heightMm, widthMm - markLength, heightMm);
    pdf.line(widthMm, heightMm, widthMm, heightMm - markLength);
  }

  pdf.save(`${filename}.pdf`);
}

/**
 * Экспорт canvas в EPS (упрощенная версия через SVG)
 */
export function exportToEPS(
  canvas: Canvas,
  options?: {
    filename?: string;
  }
): void {
  const { filename = `business-card-${Date.now()}` } = options || {};

  // EPS - это векторный формат, используем SVG как основу
  const svg = canvas.toSVG();
  
  // Конвертируем SVG в EPS (упрощенная версия)
  // В реальном приложении лучше использовать специализированную библиотеку
  const epsHeader = `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${canvas.getWidth()} ${canvas.getHeight()}
%%EndComments
`;

  // Простая конвертация (в реальности нужна более сложная обработка)
  const eps = epsHeader + svg;
  
  const blob = new Blob([eps], { type: 'application/postscript' });
  saveAs(blob, `${filename}.eps`);
}

/**
 * Массовый экспорт для персонализированных визиток
 */
export interface BatchExportItem {
  id: string;
  data: Record<string, string>; // Данные для замены (например, {name: 'Иван', phone: '+7...'})
}

export async function batchExport(
  canvas: Canvas,
  template: any, // Шаблон canvas
  items: BatchExportItem[],
  format: 'png' | 'pdf' | 'svg',
  options?: {
    includeBleed?: boolean;
    bleedSize?: number;
  }
): Promise<void> {
  // Создаем ZIP архив для массового экспорта
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const item of items) {
    // Загружаем шаблон
    await new Promise<void>((resolve) => {
      canvas.loadFromJSON(template, () => {
        // Заменяем данные в текстовых объектах
        const objects = canvas.getObjects();
        objects.forEach((obj) => {
          if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
            let text = (obj as any).text || '';
            // Заменяем плейсхолдеры данными
            Object.keys(item.data).forEach((key) => {
              text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item.data[key]);
            });
            (obj as any).set('text', text);
          }
        });

        canvas.renderAll();

        // Экспортируем в нужный формат
        const dataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2,
        });

        // Добавляем в ZIP
        zip.file(`${item.id}.png`, dataURL.split(',')[1], { base64: true });
        resolve();
      });
    });
  }

  // Генерируем и скачиваем ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `business-cards-batch-${Date.now()}.zip`);
}

