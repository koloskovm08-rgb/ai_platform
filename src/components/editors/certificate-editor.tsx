'use client';

import * as React from 'react';
import * as fabric from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { useToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Award, Stamp, Download, Type, Image as ImageIcon,
  FileText, PenTool
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { CanvasContainer } from './canvas-container';

export type CertificateType = 'diploma' | 'certificate' | 'award' | 'custom';

const CERTIFICATE_SIZES = {
  diploma: { width: 210, height: 297, label: 'Диплом A4' },
  certificate: { width: 210, height: 297, label: 'Сертификат A4' },
  award: { width: 297, height: 420, label: 'Грамота A3' },
  custom: { width: 210, height: 297, label: 'Кастомный' },
};

const mmToPx = (mm: number, dpi: number = 300) => {
  return Math.round((mm / 25.4) * dpi);
};

export function CertificateEditor() {
  const toast = useToast();
  
  const [certType, setCertType] = React.useState<CertificateType>('certificate');
  const [recipientName, setRecipientName] = React.useState('');
  const [courseName, setCourseName] = React.useState('');
  const [date, setDate] = React.useState(new Date().toLocaleDateString('ru-RU'));
  const [signature, setSignature] = React.useState('');
  const [showWatermark, setShowWatermark] = React.useState(true);
  const [watermarkText, setWatermarkText] = React.useState('ОРИГИНАЛ');

  const size = CERTIFICATE_SIZES[certType];
  const width = mmToPx(size.width);
  const height = mmToPx(size.height);

  const {
    canvasRef,
    canvas,
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFabricCanvas({ 
    width, 
    height,
    backgroundColor: '#fefefe',
  });

  React.useEffect(() => {
    if (!canvas) return;
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.backgroundColor = '#fefefe';
    
    // Добавляем декоративную рамку
    const border = new fabric.Rect({
      width: width - 40,
      height: height - 40,
      left: 20,
      top: 20,
      fill: 'transparent',
      stroke: '#d4af37',
      strokeWidth: 8,
      rx: 0,
      ry: 0,
    });
    canvas.add(border);
    canvas.sendObjectToBack(border);
    
    // Добавляем водяной знак
    if (showWatermark) {
      const watermark = new fabric.IText(watermarkText, {
        left: width / 2,
        top: height / 2,
        originX: 'center',
        originY: 'center',
        fontSize: 120,
        fontFamily: 'Arial',
        fill: 'rgba(0,0,0,0.05)',
        angle: -45,
        selectable: false,
        evented: false,
      });
      canvas.add(watermark);
      canvas.sendObjectToBack(watermark);
    }
    
    canvas.renderAll();
  }, [canvas, width, height, showWatermark, watermarkText]);

  const handleApplyTemplate = () => {
    if (!canvas) return;
    
    // Очищаем текст
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'i-text' || obj.type === 'text') {
        canvas.remove(obj);
      }
    });

    // Заголовок
    if (certType === 'certificate') {
      const title = new fabric.IText('СЕРТИФИКАТ', {
        left: width / 2,
        top: 100,
        originX: 'center',
        originY: 'center',
        fontSize: 48,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#1a1a1a',
      });
      canvas.add(title);
    }

    // Имя получателя
    if (recipientName) {
      const nameText = new fabric.IText(recipientName, {
        left: width / 2,
        top: height / 2 - 50,
        originX: 'center',
        originY: 'center',
        fontSize: 36,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#1a1a1a',
      });
      canvas.add(nameText);
    }

    // Название курса
    if (courseName) {
      const courseText = new fabric.IText(`за успешное прохождение курса "${courseName}"`, {
        left: width / 2,
        top: height / 2 + 30,
        originX: 'center',
        originY: 'center',
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#333333',
      });
      canvas.add(courseText);
    }

    // Дата
    if (date) {
      const dateText = new fabric.IText(`Дата выдачи: ${date}`, {
        left: width / 2,
        top: height - 150,
        originX: 'center',
        originY: 'center',
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#666666',
      });
      canvas.add(dateText);
    }

    // Подпись
    if (signature) {
      const sigText = new fabric.IText(signature, {
        left: width - 100,
        top: height - 100,
        originX: 'center',
        originY: 'center',
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#333333',
      });
      canvas.add(sigText);
    }

    canvas.renderAll();
    saveHistory();
  };

  const handleAddStamp = () => {
    if (!canvas) return;
    const stamp = new fabric.Circle({
      radius: 60,
      left: width - 150,
      top: height - 150,
      fill: 'transparent',
      stroke: '#dc2626',
      strokeWidth: 4,
    });
    
    const stampText = new fabric.IText('ПЕЧАТЬ', {
      left: width - 150,
      top: height - 150,
      originX: 'center',
      originY: 'center',
      fontSize: 20,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#dc2626',
    });
    
    canvas.add(stamp);
    canvas.add(stampText);
    canvas.renderAll();
    saveHistory();
  };

  const handleExport = () => {
    if (!canvas) return;
    exportAsImage(canvas, 'png', `certificate-${Date.now()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редактор сертификатов</h2>
          <p className="text-sm text-muted-foreground">Создавайте сертификаты и дипломы</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Тип документа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={certType} onChange={(e) => setCertType(e.target.value as CertificateType)}>
                <option value="diploma">Диплом</option>
                <option value="certificate">Сертификат</option>
                <option value="award">Грамота</option>
                <option value="custom">Кастомный</option>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Имя получателя</Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Иван Иванов"
                />
              </div>
              <div className="space-y-2">
                <Label>Название курса</Label>
                <Input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Основы веб-разработки"
                />
              </div>
              <div className="space-y-2">
                <Label>Дата</Label>
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="01.01.2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Подпись</Label>
                <Input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Директор"
                />
              </div>
              <Button variant="default" className="w-full" onClick={handleApplyTemplate}>
                <FileText className="mr-2 h-4 w-4" />
                Применить данные
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Элементы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleAddStamp}>
                <Stamp className="mr-2 h-4 w-4" />
                Добавить печать
              </Button>
              <div className="flex items-center justify-between">
                <Label>Водяной знак</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWatermark(!showWatermark)}
                >
                  {showWatermark ? 'Скрыть' : 'Показать'}
                </Button>
              </div>
              {showWatermark && (
                <Input
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Текст водяного знака"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">История</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={undo} disabled={!canUndo}>
                Отменить
              </Button>
              <Button variant="outline" className="w-full" onClick={redo} disabled={!canRedo}>
                Повторить
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Экспорт</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт PNG
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-muted p-8 overflow-auto">
        <div className="bg-white shadow-2xl">
          <CanvasContainer
            canvasRef={canvasRef}
            canvasWidth={width}
            canvasHeight={height}
            showGrid={false}
            onToggleGrid={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

