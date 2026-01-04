'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { Canvas, FabricText, IText } from 'fabric';
import { cn } from '@/lib/utils';
import { ColorPicker } from './color-picker';

export interface FontSettings {
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic' | 'oblique';
  textDecoration: 'none' | 'underline' | 'line-through';
  fill: string;
  lineHeight: number;
  charSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

interface FontEditorProps {
  canvas: Canvas | null;
  onUpdate?: () => void;
  className?: string;
}

// Популярные шрифты, доступные в большинстве браузеров
const AVAILABLE_FONTS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Palatino', label: 'Palatino' },
  { value: 'Garamond', label: 'Garamond' },
  { value: 'Bookman', label: 'Bookman' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Arial Black', label: 'Arial Black' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Lucida Console', label: 'Lucida Console' },
];

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Обычный (400)' },
  { value: 'bold', label: 'Жирный (700)' },
  { value: '100', label: 'Тонкий (100)' },
  { value: '200', label: 'Сверхлегкий (200)' },
  { value: '300', label: 'Легкий (300)' },
  { value: '500', label: 'Средний (500)' },
  { value: '600', label: 'Полужирный (600)' },
  { value: '800', label: 'Сверхжирный (800)' },
  { value: '900', label: 'Черный (900)' },
];

export function FontEditor({ canvas, onUpdate, className }: FontEditorProps) {
  const [settings, setSettings] = React.useState<FontSettings>({
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    fill: '#000000',
    lineHeight: 1.2,
    charSpacing: 0,
    textAlign: 'left',
  });

  // Загружаем настройки из выбранного текстового объекта
  React.useEffect(() => {
    if (!canvas) return;

    const updateFromSelection = () => {
      try {
        const activeObject = canvas.getActiveObject();
        
        if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text' || activeObject.type === 'textbox')) {
          const textObject = activeObject as IText | FabricText;
          
          setSettings({
            fontFamily: (textObject.fontFamily as string) || 'Arial',
            fontSize: textObject.fontSize || 24,
            fontWeight: textObject.fontWeight || 'normal',
            fontStyle: (textObject.fontStyle as 'normal' | 'italic' | 'oblique') || 'normal',
            textDecoration: (textObject.get('textDecoration') as 'none' | 'underline' | 'line-through') || 'none',
            fill: (textObject.fill as string) || '#000000',
            lineHeight: textObject.lineHeight || 1.2,
            charSpacing: textObject.charSpacing || 0,
            textAlign: (textObject.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
          });
        }
      } catch (error) {
        // Игнорируем ошибки при размонтировании
        console.warn('Ошибка при обновлении настроек шрифта:', error);
      }
    };

    // Обновляем при изменении выделения
    canvas.on('selection:created', updateFromSelection);
    canvas.on('selection:updated', updateFromSelection);
    canvas.on('object:modified', updateFromSelection);

    // Проверяем текущее выделение
    updateFromSelection();

    return () => {
      try {
        canvas.off('selection:created', updateFromSelection);
        canvas.off('selection:updated', updateFromSelection);
        canvas.off('object:modified', updateFromSelection);
      } catch (error) {
        // Игнорируем ошибки при очистке (это нормально при unmount)
        if (process.env.NODE_ENV === 'development') {
          console.warn('Ошибка при очистке подписок canvas:', error);
        }
      }
    };
  }, [canvas]);

  // Применяем настройки к выбранному текстовому объекту
  const applySettings = React.useCallback((newSettings: Partial<FontSettings>) => {
    if (!canvas) return;

    try {
      const activeObject = canvas.getActiveObject();
      if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'text' && activeObject.type !== 'textbox')) {
        return;
      }

      const textObject = activeObject as IText | FabricText;

      if (newSettings.fontFamily !== undefined) {
        textObject.set('fontFamily', newSettings.fontFamily);
      }
      if (newSettings.fontSize !== undefined) {
        textObject.set('fontSize', newSettings.fontSize);
      }
      if (newSettings.fontWeight !== undefined) {
        textObject.set('fontWeight', newSettings.fontWeight);
      }
      if (newSettings.fontStyle !== undefined) {
        textObject.set('fontStyle', newSettings.fontStyle);
      }
      if (newSettings.textDecoration !== undefined) {
        textObject.set('textDecoration', newSettings.textDecoration);
      }
      if (newSettings.fill !== undefined) {
        textObject.set('fill', newSettings.fill);
      }
      if (newSettings.lineHeight !== undefined) {
        textObject.set('lineHeight', newSettings.lineHeight);
      }
      if (newSettings.charSpacing !== undefined) {
        textObject.set('charSpacing', newSettings.charSpacing);
      }
      if (newSettings.textAlign !== undefined) {
        textObject.set('textAlign', newSettings.textAlign);
      }

      canvas.renderAll();
      onUpdate?.();
    } catch (error) {
      // Игнорируем ошибки, если canvas был размонтирован
      console.warn('Ошибка при применении настроек шрифта:', error);
    }
  }, [canvas, onUpdate]);

  const handleSettingChange = (key: keyof FontSettings, value: FontSettings[keyof FontSettings]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings({ [key]: value });
  };

  const activeObject = canvas?.getActiveObject();
  const isTextSelected = activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text' || activeObject.type === 'textbox');

  if (!isTextSelected) {
    return (
      <Card className={cn('opacity-50', className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-4 w-4" />
            Редактор шрифтов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Выберите текстовый объект для редактирования
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Type className="h-4 w-4" />
          Редактор шрифтов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Семейство шрифта */}
        <div className="space-y-2">
          <Label>Шрифт</Label>
          <Select
            value={settings.fontFamily}
            onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Размер шрифта */}
        <div className="space-y-2">
          <Label>Размер: {settings.fontSize}px</Label>
          <Input
            type="number"
            min="8"
            max="200"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', Number(e.target.value))}
          />
        </div>

        {/* Насыщенность (weight) */}
        <div className="space-y-2">
          <Label>Насыщенность</Label>
          <Select
            value={String(settings.fontWeight)}
            onChange={(e) => handleSettingChange('fontWeight', e.target.value)}
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Стиль текста (жирный, курсив, подчеркивание) */}
        <div className="space-y-2">
          <Label>Стиль</Label>
          <div className="flex gap-2">
            <Button
              variant={settings.fontWeight === 'bold' || settings.fontWeight === '700' || Number(settings.fontWeight) >= 600 ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newWeight = settings.fontWeight === 'bold' || settings.fontWeight === '700' || Number(settings.fontWeight) >= 600 ? 'normal' : 'bold';
                handleSettingChange('fontWeight', newWeight);
              }}
              className="flex-1"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={settings.fontStyle === 'italic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newStyle = settings.fontStyle === 'italic' ? 'normal' : 'italic';
                handleSettingChange('fontStyle', newStyle);
              }}
              className="flex-1"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={settings.textDecoration === 'underline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newDecoration = settings.textDecoration === 'underline' ? 'none' : 'underline';
                handleSettingChange('textDecoration', newDecoration);
              }}
              className="flex-1"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Цвет текста */}
        <ColorPicker
          value={settings.fill}
          onChange={(color) => handleSettingChange('fill', color)}
          label="Цвет текста"
        />

        {/* Межстрочный интервал */}
        <div className="space-y-2">
          <Label>Межстрочный интервал: {settings.lineHeight}</Label>
          <Input
            type="number"
            min="0.5"
            max="5"
            step="0.1"
            value={settings.lineHeight}
            onChange={(e) => handleSettingChange('lineHeight', Number(e.target.value))}
          />
        </div>

        {/* Межбуквенный интервал */}
        <div className="space-y-2">
          <Label>Межбуквенный интервал: {settings.charSpacing}px</Label>
          <Input
            type="number"
            min="-50"
            max="100"
            value={settings.charSpacing}
            onChange={(e) => handleSettingChange('charSpacing', Number(e.target.value))}
          />
        </div>

        {/* Выравнивание текста */}
        <div className="space-y-2">
          <Label>Выравнивание</Label>
          <div className="flex gap-2">
            <Button
              variant={settings.textAlign === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSettingChange('textAlign', 'left')}
              className="flex-1"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={settings.textAlign === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSettingChange('textAlign', 'center')}
              className="flex-1"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={settings.textAlign === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSettingChange('textAlign', 'right')}
              className="flex-1"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

