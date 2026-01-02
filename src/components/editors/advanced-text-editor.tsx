'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sparkles,
  Layers,
} from 'lucide-react';
import * as fabric from 'fabric';
import type { Canvas, IText, FabricText } from 'fabric';
import { cn } from '@/lib/utils';
import { ColorPicker } from './color-picker';

interface AdvancedTextEditorProps {
  canvas: Canvas | null;
  onUpdate?: () => void;
  className?: string;
}

export interface AdvancedTextSettings {
  // Базовые настройки
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic' | 'oblique';
  fill: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';

  // Расширенные настройки типографики
  lineHeight: number; // Leading - межстрочный интервал
  charSpacing: number; // Tracking/Kerning - межбуквенное расстояние
  textBackgroundColor?: string;
  
  // Деформация и эффекты
  textDecoration: 'none' | 'underline' | 'line-through' | 'overline';
  underline?: boolean;
  linethrough?: boolean;
  overline?: boolean;
  
  // Дополнительные эффекты
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke?: {
    color: string;
    width: number;
  };
}

export function AdvancedTextEditor({
  canvas,
  onUpdate,
  className,
}: AdvancedTextEditorProps) {
  const [settings, setSettings] = React.useState<AdvancedTextSettings>({
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fill: '#000000',
    textAlign: 'left',
    lineHeight: 1.2,
    charSpacing: 0,
    textDecoration: 'none',
  });

  const [hasShadow, setHasShadow] = React.useState(false);
  const [hasStroke, setHasStroke] = React.useState(false);

  // Загружаем настройки из выбранного текстового объекта
  React.useEffect(() => {
    if (!canvas) return;

    const updateFromSelection = () => {
      try {
        const activeObject = canvas.getActiveObject();
        
        if (
          activeObject &&
          (activeObject.type === 'i-text' ||
            activeObject.type === 'text' ||
            activeObject.type === 'textbox')
        ) {
          const textObject = activeObject as IText | FabricText;
          
          const shadow = textObject.shadow as fabric.Shadow | null;
          const stroke = textObject.stroke;

          setSettings({
            fontFamily: (textObject.fontFamily as string) || 'Arial',
            fontSize: textObject.fontSize || 24,
            fontWeight: textObject.fontWeight || 'normal',
            fontStyle:
              (textObject.fontStyle as 'normal' | 'italic' | 'oblique') ||
              'normal',
            fill: (textObject.fill as string) || '#000000',
            textAlign:
              (textObject.textAlign as 'left' | 'center' | 'right' | 'justify') ||
              'left',
            lineHeight: textObject.lineHeight || 1.2,
            charSpacing: textObject.charSpacing || 0,
            textDecoration:
              (textObject.get('textDecoration') as
                | 'none'
                | 'underline'
                | 'line-through'
                | 'overline') || 'none',
          });

          setHasShadow(!!shadow);
          setHasStroke(!!stroke && (stroke as string) !== 'transparent');
        }
      } catch (error) {
        console.warn('Ошибка при обновлении настроек текста:', error);
      }
    };

    canvas.on('selection:created', updateFromSelection);
    canvas.on('selection:updated', updateFromSelection);
    canvas.on('object:modified', updateFromSelection);

    updateFromSelection();

    return () => {
      try {
        canvas.off('selection:created', updateFromSelection);
        canvas.off('selection:updated', updateFromSelection);
        canvas.off('object:modified', updateFromSelection);
      } catch (error) {
        console.warn('Ошибка при очистке подписок:', error);
      }
    };
  }, [canvas]);

  // Применяем настройки к текстовому объекту
  const applySettings = React.useCallback(
    (newSettings: Partial<AdvancedTextSettings>) => {
      if (!canvas) return;

      try {
        const activeObject = canvas.getActiveObject();
        if (
          !activeObject ||
          (activeObject.type !== 'i-text' &&
            activeObject.type !== 'text' &&
            activeObject.type !== 'textbox')
        ) {
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
        if (newSettings.fill !== undefined) {
          textObject.set('fill', newSettings.fill);
        }
        if (newSettings.textAlign !== undefined) {
          textObject.set('textAlign', newSettings.textAlign);
        }
        if (newSettings.lineHeight !== undefined) {
          textObject.set('lineHeight', newSettings.lineHeight);
        }
        if (newSettings.charSpacing !== undefined) {
          textObject.set('charSpacing', newSettings.charSpacing);
        }
        if (newSettings.textDecoration !== undefined) {
          textObject.set('textDecoration', newSettings.textDecoration);
        }

        canvas.renderAll();
        onUpdate?.();
      } catch (error) {
        console.warn('Ошибка при применении настроек текста:', error);
      }
    },
    [canvas, onUpdate]
  );

  const handleSettingChange = (
    key: keyof AdvancedTextSettings,
    value: AdvancedTextSettings[keyof AdvancedTextSettings]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings({ [key]: value });
  };

  const handleShadowToggle = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (
      !activeObject ||
      (activeObject.type !== 'i-text' &&
        activeObject.type !== 'text' &&
        activeObject.type !== 'textbox')
    ) {
      return;
    }

    const textObject = activeObject as IText | FabricText;
    if (hasShadow) {
      textObject.set('shadow', null);
      setHasShadow(false);
    } else {
      textObject.set(
        'shadow',
        new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 5,
          offsetX: 2,
          offsetY: 2,
        })
      );
      setHasShadow(true);
    }
    canvas.renderAll();
    onUpdate?.();
  };

  const handleStrokeToggle = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (
      !activeObject ||
      (activeObject.type !== 'i-text' &&
        activeObject.type !== 'text' &&
        activeObject.type !== 'textbox')
    ) {
      return;
    }

    const textObject = activeObject as IText | FabricText;
    if (hasStroke) {
      textObject.set('stroke', 'transparent');
      setHasStroke(false);
    } else {
      textObject.set('stroke', '#000000');
      textObject.set('strokeWidth', 1);
      setHasStroke(true);
    }
    canvas.renderAll();
    onUpdate?.();
  };

  const activeObject = canvas?.getActiveObject();
  const isTextSelected =
    activeObject &&
    (activeObject.type === 'i-text' ||
      activeObject.type === 'text' ||
      activeObject.type === 'textbox');

  if (!isTextSelected) {
    return (
      <Card className={cn('opacity-50', className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-4 w-4" />
            Расширенный редактор текста
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
          Расширенный редактор текста
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Размер шрифта */}
        <div className="space-y-2">
          <Label>Размер: {settings.fontSize}px</Label>
          <Input
            type="number"
            min="8"
            max="200"
            value={settings.fontSize}
            onChange={(e) =>
              handleSettingChange('fontSize', Number(e.target.value))
            }
          />
        </div>

        {/* Leading (межстрочный интервал) */}
        <div className="space-y-2">
          <Label>Leading (межстрочный): {settings.lineHeight.toFixed(2)}</Label>
          <Slider
            value={[settings.lineHeight]}
            min={0.5}
            max={3}
            step={0.1}
            onValueChange={([value]) =>
              handleSettingChange('lineHeight', value)
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5</span>
            <span>1.5</span>
            <span>3.0</span>
          </div>
        </div>

        {/* Tracking/Kerning (межбуквенное расстояние) */}
        <div className="space-y-2">
          <Label>Tracking/Kerning: {settings.charSpacing}px</Label>
          <Slider
            value={[settings.charSpacing]}
            min={-50}
            max={100}
            step={1}
            onValueChange={([value]) =>
              handleSettingChange('charSpacing', value)
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-50</span>
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        {/* Цвет текста */}
        <ColorPicker
          value={settings.fill}
          onChange={(color) => handleSettingChange('fill', color)}
          label="Цвет текста"
        />

        {/* Выравнивание */}
        <div className="space-y-2">
          <Label>Выравнивание</Label>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={settings.textAlign === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSettingChange('textAlign', 'left')}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={settings.textAlign === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSettingChange('textAlign', 'center')}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={settings.textAlign === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSettingChange('textAlign', 'right')}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant={settings.textAlign === 'justify' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSettingChange('textAlign', 'justify')}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Эффекты */}
        <div className="space-y-2">
          <Label>Эффекты</Label>
          <div className="flex gap-2">
            <Button
              variant={hasShadow ? 'default' : 'outline'}
              size="sm"
              onClick={handleShadowToggle}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Тень
            </Button>
            <Button
              variant={hasStroke ? 'default' : 'outline'}
              size="sm"
              onClick={handleStrokeToggle}
              className="flex-1"
            >
              <Layers className="h-4 w-4 mr-2" />
              Обводка
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

