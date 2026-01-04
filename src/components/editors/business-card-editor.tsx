'use client';

import * as React from 'react';
import Image from 'next/image';
import * as fabric from 'fabric';
import type { FabricObject } from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { useSession } from 'next-auth/react';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Save,
  FolderOpen,
  FolderPlus,
  Check,
  Loader2,
  Layers
} from 'lucide-react';
import { exportAsImage, loadFromJSON, enableDrawingMode, disableDrawingMode, setBrushSettings, groupSelected, ungroupSelected } from '@/lib/utils/image-editor';
import { alignSelectedObjects, distributeObjects } from '@/lib/utils/alignment';
import { BusinessCardTemplates } from './business-card-templates';
import { PrintLayoutEditor } from './print-layout-editor';
import { ModernToolbar } from '@/components/editor/modern-toolbar';
import { CanvasContainer } from './canvas-container';
import { AdvancedTextEditor } from './advanced-text-editor';
import { ImageToolsPanel } from './image-tools-panel';
import { AILayoutSuggestions } from '@/components/editor/ai-layout-suggestions';
import { AIColorPalette } from '@/components/editor/ai-color-palette';
import { AITextAssist } from '@/components/editor/ai-text-assist';
import { BusinessCardImageGenerator } from './business-card-image-generator';
import { Mockup3DPreview } from './3d-mockup-preview';
import { ExportDialog } from './export-dialog';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useFileDrop } from '@/hooks/use-file-drop';
import { enablePerformanceMode } from '@/lib/utils/canvas-optimization';
import type { LayoutSuggestion, ColorPalette } from '@/lib/ai/editor-assistant';
import { QRCodeGenerator } from './qr-code-generator';
import { useCustomCursor, type ToolType } from './custom-cursors';
import { setupCanvasFeedback, animateObjectIn, enhanceObjectControls } from './canvas-animations';
import { useAdvancedCanvasTools } from '@/hooks/use-advanced-canvas-tools';
import { PublishDialog } from '@/components/social/publish-dialog';

export type CardOrientation = 'horizontal' | 'vertical';
export type CardSize = 'standard' | 'european' | 'custom';

const CARD_SIZES = {
  standard: { width: 90, height: 50, label: 'Стандарт (90x50 мм)' },
  european: { width: 85, height: 55, label: 'Европейский (85x55 мм)' },
  custom: { width: 90, height: 50, label: 'Кастомный' },
};

// Конвертация мм в пиксели (при 300 DPI для печати)
const mmToPx = (mm: number, dpi: number = 300) => {
  return Math.round((mm / 25.4) * dpi);
};

export function BusinessCardEditor() {
  const { data: session } = useSession();
  const toast = useToast();
  
  const [cardSize, setCardSize] = React.useState<CardSize>('standard');
  const [orientation, setOrientation] = React.useState<CardOrientation>('horizontal');
  const [customWidth, setCustomWidth] = React.useState(90);
  const [customHeight, setCustomHeight] = React.useState(50);
  
  // Управление проектом
  const [projectName, setProjectName] = React.useState('Новый проект');
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [projectsDialogOpen, setProjectsDialogOpen] = React.useState(false);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = React.useState(false);
  interface Project {
    id: string;
    name: string;
    thumbnailUrl?: string | null;
    canvasData?: unknown;
    config?: Record<string, unknown>;
    updatedAt?: string | Date;
  }
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = React.useState('');
  const [templatesDialogOpen, setTemplatesDialogOpen] = React.useState(false);
  const [printLayoutDialogOpen, setPrintLayoutDialogOpen] = React.useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = React.useState(false);
  
  // AI диалоги
  const [aiLayoutDialogOpen, setAiLayoutDialogOpen] = React.useState(false);
  const [aiColorPaletteDialogOpen, setAiColorPaletteDialogOpen] = React.useState(false);
  const [aiTextAssistDialogOpen, setAiTextAssistDialogOpen] = React.useState(false);
  const [aiImageGeneratorOpen, setAiImageGeneratorOpen] = React.useState(false);
  
  // Multi-page и экспорт
  const [pages, setPages] = React.useState<Array<{ id: string; name: string; canvasData: unknown }>>([
    { id: 'page-1', name: 'Страница 1', canvasData: null },
  ]);
  const [currentPageId, setCurrentPageId] = React.useState<string>('page-1');
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [mockup3dOpen, setMockup3dOpen] = React.useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false);
  const [publishImageUrl, setPublishImageUrl] = React.useState<string | null>(null);
  
  // Контактная информация
  const [name, setName] = React.useState('');
  const [position, setPosition] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [website, setWebsite] = React.useState('');

  // Новые инструменты и состояния
  const [activeTool, setActiveTool] = React.useState<ToolType>('select');
  const [showGrid, setShowGrid] = React.useState(true);
  const [brushColor] = React.useState('#000000');
  const [brushWidth] = React.useState(5);

  const size = CARD_SIZES[cardSize];
  const width = cardSize === 'custom' ? customWidth : size.width;
  const height = cardSize === 'custom' ? customHeight : size.height;
  const finalWidth = orientation === 'horizontal' ? width : height;
  const finalHeight = orientation === 'horizontal' ? height : width;

  // Конвертируем в пиксели для canvas (используем 300 DPI для качественной печати)
  const canvasWidth = mmToPx(finalWidth, 300);
  const canvasHeight = mmToPx(finalHeight, 300);

  const {
    canvasRef,
    canvas,
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFabricCanvas({ 
    width: canvasWidth, 
    height: canvasHeight,
    backgroundColor: '#ffffff',
  });

  // Оптимизация производительности canvas
  React.useEffect(() => {
    if (!canvas) return;
    const cleanup = enablePerformanceMode(canvas);
    return cleanup;
  }, [canvas]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'z',
      ctrl: true,
      action: () => {
        if (canUndo) undo();
      },
      description: 'Отменить',
    },
    {
      key: 'y',
      ctrl: true,
      action: () => {
        if (canRedo) redo();
      },
      description: 'Повторить',
    },
    {
      key: 'c',
      ctrl: true,
      action: () => {
        if (canvas) {
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            const json = JSON.stringify(activeObject.toObject());
            navigator.clipboard.writeText(json);
          }
        }
      },
      description: 'Копировать',
    },
    {
      key: 'v',
      ctrl: true,
      action: async () => {
        if (!canvas) return;
        try {
          const text = await navigator.clipboard.readText();
          const obj = JSON.parse(text);
          const fabric = await import('fabric');
          fabric.FabricObject.fromObject(obj).then((obj) => {
            obj.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
            const fabricObj = obj as fabric.FabricObject;
            canvas.add(fabricObj as fabric.FabricObject);
            canvas.setActiveObject(fabricObj as fabric.FabricObject);
            canvas.renderAll();
            saveHistory();
          });
        } catch (error) {
          console.error('Paste error:', error);
        }
      },
      description: 'Вставить',
    },
    {
      key: 'Delete',
      action: () => {
        if (canvas) {
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            canvas.remove(activeObject);
            canvas.renderAll();
            saveHistory();
          }
        }
      },
      description: 'Удалить',
    },
    {
      key: 'd',
      ctrl: true,
      action: () => {
        if (canvas) {
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            activeObject.clone().then((cloned: FabricObject) => {
              cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
              canvas.add(cloned);
              canvas.setActiveObject(cloned);
              canvas.renderAll();
              saveHistory();
            });
          }
        }
      },
      description: 'Дублировать',
    },
  ]);

  // Автосохранение
  useAutoSave({
    data: canvas ? canvas.toJSON() : null,
    onSave: async (data) => {
      if (!data || !projectId) return;
      // Автосохранение в localStorage
      localStorage.setItem(`project-${projectId}`, JSON.stringify(data));
    },
    interval: 30000, // 30 секунд
    enabled: !!canvas && !!projectId,
    debounceMs: 2000,
  });

  // Drag & Drop для файлов
  useFileDrop({
    onDrop: async (files) => {
      if (!canvas) return;
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          const fabric = await import('fabric');
          fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
            img.set({
              left: canvas.getWidth() / 2,
              top: canvas.getHeight() / 2,
              originX: 'center',
              originY: 'center',
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            saveHistory();
            URL.revokeObjectURL(url);
          });
        }
      }
    },
    accept: 'image/*',
    multiple: true,
  });

  // Настройка курсора
  useCustomCursor(canvas, activeTool);

  // Расширенные инструменты canvas
  const {
    smartGuidesEnabled,
    snapToGridEnabled,
    gridVisible,
    toggleSmartGuides: toggleSmartGuidesHandler,
    toggleSnapToGrid: toggleSnapToGridHandler,
  } = useAdvancedCanvasTools(canvas, {
    multiSelect: true,
    smartGuides: true,
    snapToGrid: true,
    gridSize: 20,
    showGrid: showGrid,
  });

  // Настройка анимаций и обратной связи canvas
  React.useEffect(() => {
    if (!canvas) return;
    setupCanvasFeedback(canvas);
    // Используем новый расширенный snap-to-grid
    toggleSnapToGridHandler(true, showGrid);
  }, [canvas, showGrid, toggleSnapToGridHandler]);

  // Обновление размера canvas при изменении размера карточки
  React.useEffect(() => {
    if (!canvas) return;
    
    try {
      canvas.setWidth(canvasWidth);
      canvas.setHeight(canvasHeight);
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    } catch (error) {
      // Игнорируем ошибки при изменении размера, если canvas был размонтирован
      console.warn('Ошибка при изменении размера canvas:', error);
    }
  }, [canvas, canvasWidth, canvasHeight]);

  const handleAddText = (text: string, options?: { fontSize?: number; top?: number; left?: number }) => {
    if (!canvas) return;
    
    const textObject = new fabric.IText(text, {
      left: options?.left ?? canvasWidth / 2,
      top: options?.top ?? canvasHeight / 2,
      originX: 'center',
      originY: 'center',
      fontSize: options?.fontSize ?? 24,
      fontFamily: 'Arial',
      fill: '#000000',
    });
    
    enhanceObjectControls(textObject);
    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    animateObjectIn(canvas, textObject);
    saveHistory();
  };

  const handleAddLogo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !canvas) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
          .then((img) => {
            // Масштабируем логотип (максимум 30% от ширины карточки)
            const maxWidth = canvasWidth * 0.3;
            if (img.width && img.width > maxWidth) {
              const scale = maxWidth / img.width;
              img.scale(scale);
            }
            
            img.set({
              left: 20,
              top: 20,
              selectable: true,
            });
            
            enhanceObjectControls(img);
            canvas.add(img);
            canvas.setActiveObject(img);
            animateObjectIn(canvas, img);
            saveHistory();
          });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleAddQRCode = () => {
    setQrCodeDialogOpen(true);
  };

  // Обработчик добавления сгенерированного изображения
  const handleAddGeneratedImage = async (imageUrl: string) => {
    if (!canvas) return;

    try {
      const fabric = await import('fabric');
      const img = await fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
      
      // Масштабируем изображение под размер визитки
      const maxWidth = canvasWidth * 0.8;
      const maxHeight = canvasHeight * 0.8;
      const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
      
      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      saveHistory();
      
      toast.success('Изображение добавлено на визитку!');
    } catch (error) {
      console.error('Error adding generated image:', error);
      toast.error('Ошибка добавления изображения');
    }
  };

  // Функции управления проектами
  const getCanvasData = React.useCallback(() => {
    if (!canvas) return null;
    return canvas.toJSON();
  }, [canvas]);

  const getThumbnail = React.useCallback(async () => {
    if (!canvas) return null;
    return canvas.toDataURL({
      format: 'png',
      quality: 0.5,
      multiplier: 0.2, // Уменьшенное превью
    });
  }, [canvas]);

  const saveProject = React.useCallback(async (name?: string, isNew: boolean = false) => {
    if (!canvas || !session?.user?.id) {
      toast.error('Необходима авторизация для сохранения проекта');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const canvasData = getCanvasData();
      const thumbnailUrl = await getThumbnail();
      const config = {
        cardSize,
        orientation,
        customWidth,
        customHeight,
        finalWidth,
        finalHeight,
        canvasWidth,
        canvasHeight,
      };

      const projectData = {
        name: name || projectName,
        canvasData,
        config,
        thumbnailUrl,
      };

      let savedProject;
      if (isNew || !projectId) {
        // Создание нового проекта
        const response = await fetch('/api/business-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });

        if (!response.ok) throw new Error('Ошибка сохранения проекта');
        const data = await response.json();
        savedProject = data.project;
        setProjectId(savedProject.id);
        setProjectName(savedProject.name);
      } else {
        // Обновление существующего проекта
        const response = await fetch(`/api/business-cards/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });

        if (!response.ok) throw new Error('Ошибка обновления проекта');
        const data = await response.json();
        savedProject = data.project;
      }

      setSaveStatus('saved');
      toast.success('Проект успешно сохранен');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: unknown) {
      console.error('Save project error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка сохранения проекта');
      setSaveStatus('idle');
    } finally {
      setIsSaving(false);
    }
  }, [canvas, session, projectName, projectId, cardSize, orientation, customWidth, customHeight, finalWidth, finalHeight, canvasWidth, canvasHeight, getCanvasData, getThumbnail, toast]);

  const openPublishDialog = async () => {
    if (!session?.user?.id) {
      toast.error('Необходима авторизация');
      return;
    }
    if (!projectId) {
      toast.error('Сначала сохрани проект, чтобы его можно было публиковать');
      return;
    }
    const thumb = await getThumbnail();
    setPublishImageUrl(thumb);
    setPublishDialogOpen(true);
  };

  const loadProject = React.useCallback(async (projectId: string) => {
    if (!canvas || !session?.user?.id) return;

    try {
      const response = await fetch(`/api/business-cards/${projectId}`);
      if (!response.ok) throw new Error('Проект не найден');

      const data = await response.json();
      const project = data.project;

      // Загружаем данные canvas
      loadFromJSON(canvas, JSON.stringify(project.canvasData));

      // Восстанавливаем настройки
      if (project.config) {
        const config = project.config as {
          cardSize?: CardSize;
          orientation?: CardOrientation;
          customWidth?: number;
          customHeight?: number;
        };
        setCardSize(config.cardSize || 'standard');
        setOrientation(config.orientation || 'horizontal');
        if (config.customWidth) setCustomWidth(config.customWidth);
        if (config.customHeight) setCustomHeight(config.customHeight);
      }

      setProjectId(project.id);
      setProjectName(project.name);
      setProjectsDialogOpen(false);
      toast.success('Проект загружен');
    } catch (error: unknown) {
      console.error('Load project error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка загрузки проекта');
    }
  }, [canvas, session, toast]);

  const loadProjects = React.useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/business-cards');
      if (!response.ok) throw new Error('Ошибка загрузки проектов');

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Load projects error:', error);
    }
  }, [session]);

  // Автосохранение (debounced)
  const canvasDataForAutoSave = React.useMemo(() => {
    if (!canvas) return null;
    return getCanvasData();
  }, [canvas, getCanvasData]);

  const debouncedCanvasData = useDebounce(canvasDataForAutoSave, 30000); // 30 секунд

  React.useEffect(() => {
    if (!debouncedCanvasData || !projectId || !session?.user?.id || isSaving) return;

    // Автосохранение
    const autoSave = async () => {
      try {
        const thumbnailUrl = await getThumbnail();
        await fetch(`/api/business-cards/${projectId}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            canvasData: debouncedCanvasData,
            thumbnailUrl,
          }),
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1000);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    };

    autoSave();
  }, [debouncedCanvasData, projectId, session, getThumbnail, isSaving]);

  // Загружаем проекты при открытии диалога
  React.useEffect(() => {
    if (projectsDialogOpen) {
      loadProjects();
    }
  }, [projectsDialogOpen, loadProjects]);

  // Применение шаблона
  const handleSelectTemplate = React.useCallback((template: {
    name: string;
    config?: {
      canvasData?: unknown;
      objects?: unknown[];
    };
  }) => {
    if (!canvas) return;

    const shouldReplace = window.confirm(
      'Заменить текущий проект шаблоном? (Отмена - добавить к текущему)'
    );

    if (shouldReplace) {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
    }

    if (template.config && template.config.canvasData) {
      const templateCanvas = template.config.canvasData as { objects?: unknown[] };
      fabric.util.enlivenObjects(templateCanvas.objects || []).then((objects) => {
        objects.forEach((obj) => {
          if (obj instanceof fabric.FabricObject) {
            canvas.add(obj);
          }
        });
        canvas.renderAll();
        saveHistory();
      });
    } else if (template.config) {
      // Альтернативный формат
      loadFromJSON(canvas, JSON.stringify(template.config));
    }

    toast.success(`Шаблон "${template.name}" применен`);
  }, [canvas, toast, saveHistory]);

  // Специализированные инструменты для визиток (зарезервировано для будущего использования)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddDivider = (direction: 'horizontal' | 'vertical') => {
    if (!canvas) return;

    const line = direction === 'horizontal'
      ? new fabric.Line([20, canvasHeight / 2, canvasWidth - 20, canvasHeight / 2], {
          stroke: '#cccccc',
          strokeWidth: 1,
          selectable: true,
        })
      : new fabric.Line([canvasWidth / 2, 20, canvasWidth / 2, canvasHeight - 20], {
          stroke: '#cccccc',
          strokeWidth: 1,
          selectable: true,
        });

    enhanceObjectControls(line);
    canvas.add(line);
    canvas.setActiveObject(line);
    animateObjectIn(canvas, line);
    saveHistory();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddContactIcon = (type: 'phone' | 'email' | 'address' | 'website') => {
    if (!canvas) return;

    const iconSize = 20;
    const iconColor = '#000000';
    
    // Создаем простую иконку как группу фигур (для демонстрации)
    // В реальном приложении можно использовать SVG иконки из lucide-react
    let iconGroup: fabric.Group;

    switch (type) {
      case 'phone':
        // Простая иконка телефона
        iconGroup = new fabric.Group([
          new fabric.Rect({ width: iconSize * 0.6, height: iconSize, fill: iconColor, left: -iconSize * 0.3, top: 0 }),
          new fabric.Circle({ radius: iconSize * 0.2, fill: iconColor, left: -iconSize * 0.2, top: iconSize * 0.9 }),
        ], { left: canvasWidth / 2, top: canvasHeight / 2, selectable: true });
        break;
      case 'email':
        // Простая иконка email
        iconGroup = new fabric.Group([
          new fabric.Rect({ width: iconSize, height: iconSize * 0.7, fill: 'transparent', stroke: iconColor, strokeWidth: 2, left: -iconSize / 2, top: -iconSize * 0.35 }),
          new fabric.Line([-iconSize / 2, -iconSize * 0.35, iconSize / 2, -iconSize * 0.35], { stroke: iconColor, strokeWidth: 2 }),
        ], { left: canvasWidth / 2, top: canvasHeight / 2, selectable: true });
        break;
      default:
        // Заглушка
        iconGroup = new fabric.Group([
          new fabric.Circle({ radius: iconSize / 2, fill: iconColor, left: -iconSize / 2, top: -iconSize / 2 }),
        ], { left: canvasWidth / 2, top: canvasHeight / 2, selectable: true });
    }

    enhanceObjectControls(iconGroup);
    canvas.add(iconGroup);
    canvas.setActiveObject(iconGroup);
    animateObjectIn(canvas, iconGroup);
    saveHistory();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddSocialIcon = (type: 'instagram' | 'facebook' | 'vk' | 'telegram') => {
    if (!canvas) return;

    const iconSize = 24;
    const iconColor = type === 'instagram' ? '#E4405F' : type === 'facebook' ? '#1877F2' : type === 'vk' ? '#4680C2' : '#0088cc';
    
    // Простая иконка соцсети
    const icon = new fabric.Circle({
      radius: iconSize / 2,
      fill: iconColor,
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      originX: 'center',
      originY: 'center',
      selectable: true,
    });

    enhanceObjectControls(icon);
    canvas.add(icon);
    canvas.setActiveObject(icon);
    animateObjectIn(canvas, icon);
    saveHistory();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddGradientBackground = (type: 'linear' | 'radial') => {
    if (!canvas) return;

    if (type === 'linear') {
      const gradient = new fabric.Gradient({
        type: 'linear',
        coords: {
          x1: 0,
          y1: 0,
          x2: canvasWidth,
          y2: canvasHeight,
        },
        colorStops: [
          { offset: 0, color: '#3b82f6' },
          { offset: 1, color: '#8b5cf6' },
        ],
      });
      canvas.backgroundColor = gradient;
    } else {
      const gradient = new fabric.Gradient({
        type: 'radial',
        coords: {
          x1: canvasWidth / 2,
          y1: canvasHeight / 2,
          r1: 0,
          x2: canvasWidth / 2,
          y2: canvasHeight / 2,
          r2: Math.max(canvasWidth, canvasHeight) / 2,
        },
        colorStops: [
          { offset: 0, color: '#3b82f6' },
          { offset: 1, color: '#8b5cf6' },
        ],
      });
      canvas.backgroundColor = gradient;
    }

    canvas.renderAll();
    saveHistory();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddBorder = () => {
    if (!canvas) return;

    const borderWidth = 2;
    const borderColor = '#000000';
    
    const border = new fabric.Rect({
      width: canvasWidth - borderWidth,
      height: canvasHeight - borderWidth,
      left: borderWidth / 2,
      top: borderWidth / 2,
      fill: 'transparent',
      stroke: borderColor,
      strokeWidth: borderWidth,
      selectable: false,
      evented: false,
    });

    canvas.add(border);
    canvas.sendObjectToBack(border);
    canvas.renderAll();
    saveHistory();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAlignSelected = (align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!canvas) return;
    alignSelectedObjects(canvas, align);
    saveHistory();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDistributeObjects = (direction: 'horizontal' | 'vertical') => {
    if (!canvas) return;
    distributeObjects(canvas, direction);
    saveHistory();
  };

  const handleApplyTemplate = () => {
    if (!canvas) return;
    
    // Очищаем canvas
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    
    // Добавляем элементы шаблона
    if (name) {
      const nameText = new fabric.IText(name, {
        left: canvasWidth / 2,
        top: canvasHeight * 0.2,
        originX: 'center',
        originY: 'center',
        fontSize: 28,
        fontFamily: 'Arial',
        fill: '#000000',
      });
      canvas.add(nameText);
    }
    if (position) {
      const positionText = new fabric.IText(position, {
        left: canvasWidth / 2,
        top: canvasHeight * 0.35,
        originX: 'center',
        originY: 'center',
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#666666',
      });
      canvas.add(positionText);
    }
    if (phone) {
      const phoneText = new fabric.IText(phone, {
        left: canvasWidth * 0.3,
        top: canvasHeight * 0.55,
        originX: 'center',
        originY: 'center',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#000000',
      });
      canvas.add(phoneText);
    }
    if (email) {
      const emailText = new fabric.IText(email, {
        left: canvasWidth * 0.3,
        top: canvasHeight * 0.7,
        originX: 'center',
        originY: 'center',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#000000',
      });
      canvas.add(emailText);
    }
    
    canvas.renderAll();
    saveHistory();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExport = (format: 'png' | 'svg') => {
    if (!canvas) return;
    exportAsImage(canvas, format, `business-card-${Date.now()}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExportPDF = () => {
    setExportDialogOpen(true);
  };

  // Multi-page функции
  const handlePageChange = React.useCallback((pageId: string) => {
    if (!canvas) return;
    
    // Сохраняем текущую страницу
    const currentPage = pages.find((p) => p.id === currentPageId);
    if (currentPage) {
      currentPage.canvasData = canvas.toJSON();
    }
    
    // Загружаем новую страницу
    const newPage = pages.find((p) => p.id === pageId);
    if (newPage && newPage.canvasData) {
      loadFromJSON(canvas, JSON.stringify(newPage.canvasData));
    } else {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    }
    
    setCurrentPageId(pageId);
    saveHistory();
  }, [canvas, pages, currentPageId, saveHistory]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePageAdd = React.useCallback(() => {
    const newPage = {
      id: `page-${Date.now()}`,
      name: `Страница ${pages.length + 1}`,
      canvasData: null,
    };
    setPages([...pages, newPage]);
    handlePageChange(newPage.id);
  }, [pages, handlePageChange]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePageDelete = React.useCallback((pageId: string) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((p) => p.id !== pageId);
    setPages(newPages);
    if (currentPageId === pageId) {
      handlePageChange(newPages[0].id);
    }
  }, [pages, currentPageId, handlePageChange]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePageDuplicate = React.useCallback((pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page || !canvas) return;
    
    const duplicatedPage = {
      id: `page-${Date.now()}`,
      name: `${page.name} (копия)`,
      canvasData: canvas.toJSON(),
    };
    
    const index = pages.findIndex((p) => p.id === pageId);
    const newPages = [...pages];
    newPages.splice(index + 1, 0, duplicatedPage);
    setPages(newPages);
  }, [pages, canvas]);

  // Новые инструменты
  const handleSelectTool = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool === 'brush' && canvas) {
      enableDrawingMode(canvas);
      setBrushSettings(canvas, brushColor, brushWidth);
    } else if (tool === 'eraser' && canvas) {
      enableDrawingMode(canvas);
      setBrushSettings(canvas, '#ffffff', brushWidth);
    } else if (canvas) {
      disableDrawingMode(canvas);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBrush = () => {
    handleSelectTool('brush');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEraser = () => {
    handleSelectTool('eraser');
  };

  const handleZoomIn = () => {
    // Zoom handled by CanvasContainer component
  };

  const handleZoomOut = () => {
    // Zoom handled by CanvasContainer component
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDuplicate = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (activeObject.left || 0) + 20,
        top: (activeObject.top || 0) + 20,
      });
      enhanceObjectControls(cloned);
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      animateObjectIn(canvas, cloned);
      saveHistory();
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGroup = () => {
    if (!canvas) return;
    groupSelected(canvas);
    saveHistory();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUngroup = () => {
    if (!canvas) return;
    ungroupSelected(canvas);
    saveHistory();
  };

  return (
    <>
    <div className="flex h-screen overflow-hidden relative">
      {/* Новая современная панель инструментов (слева, fixed) */}
      <ModernToolbar
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onSave={() => saveProject(undefined, false)}
        onSaveAs={() => setSaveAsDialogOpen(true)}
        onLoadProject={() => setProjectsDialogOpen(true)}
        isSaving={isSaving}
        saveStatus={saveStatus}
        hasSession={!!session}
        onAddText={() => handleAddText('Текст')}
        onAddLogo={handleAddLogo}
        onAddQRCode={handleAddQRCode}
        onSelectTool={handleSelectTool}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onShare={() => {}}
        onCollaborate={() => {}}
        onMove={() => handleSelectTool('select')}
        onRotate={() => {}}
        onFlipHorizontal={() => {}}
        onFlipVertical={() => {}}
        onTextBold={() => {}}
        onTextItalic={() => {}}
        onTextUnderline={() => {}}
        onChangeTextColor={() => {}}
        onImageUpload={handleAddLogo}
        onImageCrop={() => {}}
        onImageRemoveBg={() => {}}
        onImageFilters={() => {}}
        onAddRectangle={() => {}}
        onAddCircle={() => {}}
        onAddTriangle={() => {}}
        onPenTool={() => {}}
        onAILayoutIdeas={() => setAiLayoutDialogOpen(true)}
        onAIColorPalette={() => setAiColorPaletteDialogOpen(true)}
        onAITextAssist={() => setAiTextAssistDialogOpen(true)}
        onAIImageGeneration={() => setAiImageGeneratorOpen(true)}
        onAIImageEnhancement={async () => {
          const activeObject = canvas?.getActiveObject();
          if (!activeObject || activeObject.type !== 'image') {
            toast.error('Выберите изображение для улучшения');
            return;
          }
          
          const img = activeObject as fabric.FabricImage;
          const element = img.getElement();
          let imageUrl: string;
          if (element instanceof HTMLImageElement) {
            imageUrl = element.src;
          } else {
            imageUrl = img.toDataURL();
          }
          
          try {
            toast.info('Улучшение изображения...');
            const response = await fetch('/api/editor/ai/image-enhancement', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl, scale: 2 }),
            });
            
            if (!response.ok) throw new Error('Ошибка улучшения');
            
            const data = await response.json();
            // Заменяем изображение
            if (canvas && data.enhancedImageUrl) {
              const fabric = await import('fabric');
              fabric.FabricImage.fromURL(data.enhancedImageUrl, { crossOrigin: 'anonymous' })
                .then((enhancedImg) => {
                  enhancedImg.set({
                    left: img.left,
                    top: img.top,
                    scaleX: img.scaleX,
                    scaleY: img.scaleY,
                    angle: img.angle,
                  });
                  canvas.remove(img);
                  canvas.add(enhancedImg);
                  canvas.setActiveObject(enhancedImg);
                  canvas.renderAll();
                  saveHistory();
                  toast.success('Изображение улучшено!');
                });
            }
          } catch (error) {
            console.error('Image enhancement error:', error);
            toast.error('Ошибка улучшения изображения');
          }
        }}
        onAIPrintLayout={() => setPrintLayoutDialogOpen(true)}
        smartGuidesEnabled={smartGuidesEnabled}
        onToggleSmartGuides={toggleSmartGuidesHandler}
        snapToGridEnabled={snapToGridEnabled}
        gridVisible={gridVisible}
        onToggleSnapToGrid={toggleSnapToGridHandler}
        activeTool={activeTool}
      />

      {/* Основной контент с отступом для панели */}
      <div className="flex-1 ml-[280px] flex gap-4 p-4 overflow-auto relative z-0">
        {/* Canvas */}
        <div className="flex-1">
          {/* Расширенный редактор текста */}
          <AdvancedTextEditor canvas={canvas} onUpdate={saveHistory} />
          
          {/* Инструменты для изображений */}
          <ImageToolsPanel canvas={canvas} onUpdate={saveHistory} />
          
          <Card>
          <CardHeader>
            <CardTitle className="text-lg">Проект</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Название проекта</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Название проекта"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => saveProject(undefined, false)}
                disabled={isSaving || !session}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : saveStatus === 'saved' ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saveStatus === 'saved' ? 'Сохранено' : 'Сохранить'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSaveAsDialogOpen(true)}
                disabled={!session}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setProjectsDialogOpen(true)}
              disabled={!session}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Загрузить проект
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => void openPublishDialog()}
              disabled={!session || !projectId}
              title={!projectId ? 'Сначала сохрани проект' : undefined}
            >
              Опубликовать в соцсети
            </Button>
          </CardContent>
        </Card>

        {/* Шаблоны */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Шаблоны</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setTemplatesDialogOpen(true)}
            >
              <Layers className="mr-2 h-4 w-4" />
              Использовать шаблон
            </Button>
          </CardContent>
        </Card>

        {/* Настройки размера */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Размер карточки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Формат</Label>
              <Select
                value={cardSize}
                onChange={(e) => setCardSize(e.target.value as CardSize)}
              >
                <option value="standard">Стандарт (90x50 мм)</option>
                <option value="european">Европейский (85x55 мм)</option>
                <option value="custom">Кастомный</option>
              </Select>
            </div>

            {cardSize === 'custom' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Ширина (мм)</Label>
                    <Input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      min={50}
                      max={200}
                    />
                  </div>
                  <div>
                    <Label>Высота (мм)</Label>
                    <Input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      min={50}
                      max={200}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Ориентация</Label>
              <div className="flex gap-2">
                <Button
                  variant={orientation === 'horizontal' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setOrientation('horizontal')}
                >
                  Горизонтальная
                </Button>
                <Button
                  variant={orientation === 'vertical' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setOrientation('vertical')}
                >
                  Вертикальная
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Контактная информация */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Контактная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Имя</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
              />
            </div>
            <div className="space-y-2">
              <Label>Должность</Label>
              <Input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Директор"
              />
            </div>
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivan@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Адрес</Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="г. Москва, ул. Примерная, д. 1"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Сайт</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.example.com"
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleApplyTemplate}
            >
              Применить информацию
            </Button>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Предпросмотр визитки</CardTitle>
            <CardDescription>
              Размер: {finalWidth}x{finalHeight} мм ({canvasWidth}x{canvasHeight} px при 300 DPI)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <CanvasContainer
              canvasRef={canvasRef}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
            />
          </CardContent>
        </Card>
      </div>
      </div>
    </div>

      {/* Диалог загрузки проектов */}
      <Dialog open={projectsDialogOpen} onOpenChange={setProjectsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Мои проекты</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {projects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                У вас пока нет сохраненных проектов
              </p>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => loadProject(project.id)}
                >
                  {project.thumbnailUrl && (
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <Image
                        src={project.thumbnailUrl}
                        alt={project.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Обновлено: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог "Сохранить как" */}
      <Dialog open={saveAsDialogOpen} onOpenChange={setSaveAsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить как новый проект</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название проекта</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Введите название проекта"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSaveAsDialogOpen(false);
                  setNewProjectName('');
                }}
              >
                Отмена
              </Button>
              <Button
                onClick={() => {
                  if (newProjectName.trim()) {
                    saveProject(newProjectName.trim(), true);
                    setSaveAsDialogOpen(false);
                    setNewProjectName('');
                  }
                }}
                disabled={!newProjectName.trim()}
              >
                Сохранить
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог шаблонов */}
      <BusinessCardTemplates
        open={templatesDialogOpen}
        onOpenChange={setTemplatesDialogOpen}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Диалог размещения на листе */}
      <PrintLayoutEditor
        open={printLayoutDialogOpen}
        onOpenChange={setPrintLayoutDialogOpen}
        sourceCanvas={canvas}
        cardWidth={finalWidth}
        cardHeight={finalHeight}
      />

      {/* Диалог генератора QR-кодов */}
      <QRCodeGenerator
        open={qrCodeDialogOpen}
        onOpenChange={setQrCodeDialogOpen}
        canvas={canvas}
        onAdd={saveHistory}
      />

      {/* AI Диалоги */}
      <AILayoutSuggestions
        open={aiLayoutDialogOpen}
        onOpenChange={setAiLayoutDialogOpen}
        canvas={canvas}
        businessInfo={{
          name,
          position,
          industry: 'не указано',
          style: 'современный',
        }}
        onApply={(suggestion: LayoutSuggestion) => {
          if (!canvas) return;
          
          // Применяем цветовую схему
          canvas.backgroundColor = suggestion.colorScheme.background;
          
          // Добавляем элементы макета
          suggestion.elements.forEach((element) => {
            const x = (element.position.x / 100) * canvasWidth;
            const y = (element.position.y / 100) * canvasHeight;
            
            if (element.type === 'text' && element.content) {
              const textObject = new fabric.IText(element.content, {
                left: x,
                top: y,
                originX: 'center',
                originY: 'center',
                fontSize: element.style?.fontSize || 24,
                fontFamily: 'Arial',
                fill: suggestion.colorScheme.text,
                fontWeight: element.style?.fontWeight || 'normal',
              });
              canvas.add(textObject);
            } else if (element.type === 'shape') {
              const rect = new fabric.Rect({
                left: x - (element.style?.width || 50) / 2,
                top: y - (element.style?.height || 50) / 2,
                width: element.style?.width || 50,
                height: element.style?.height || 50,
                fill: element.style?.fill || suggestion.colorScheme.primary,
              });
              canvas.add(rect);
            }
          });
          
          canvas.renderAll();
          saveHistory();
          toast.success('Макет применен!');
        }}
      />

      <AIColorPalette
        open={aiColorPaletteDialogOpen}
        onOpenChange={setAiColorPaletteDialogOpen}
        canvas={canvas}
        context={{
          industry: 'не указано',
          mood: 'профессиональное',
        }}
        onApply={(palette: ColorPalette) => {
          if (!canvas) return;
          
          // Применяем цветовую палитру к canvas
          canvas.backgroundColor = palette.background;
          
          // Применяем к выбранным объектам
          const activeObjects = canvas.getActiveObjects();
          activeObjects.forEach((obj) => {
            if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
              obj.set('fill', palette.text);
            }
          });
          
          canvas.renderAll();
          saveHistory();
          toast.success('Цветовая палитра применена!');
        }}
      />

      <AITextAssist
        open={aiTextAssistDialogOpen}
        onOpenChange={setAiTextAssistDialogOpen}
        canvas={canvas}
        context={{
          purpose: 'визитка',
          industry: 'не указано',
          tone: 'профессиональный',
        }}
          onApply={() => {
          saveHistory();
          toast.success('Текст обновлен!');
        }}
      />

      {/* Диалог генерации изображений для визиток */}
      <BusinessCardImageGenerator
        open={aiImageGeneratorOpen}
        onOpenChange={setAiImageGeneratorOpen}
        onImageGenerated={handleAddGeneratedImage}
      />

      {/* Диалог экспорта */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        canvas={canvas}
        cardWidth={finalWidth}
        cardHeight={finalHeight}
      />

      {/* Диалог публикации */}
      {projectId && (
        <PublishDialog
          open={publishDialogOpen}
          onOpenChange={setPublishDialogOpen}
          contentType="BUSINESS_CARD_PROJECT"
          contentId={projectId}
          // thumbnailUrl у проекта — часто data: URL. Для Telegram PublishDialog сам загрузит в Cloudinary при необходимости.
          imageUrl={publishImageUrl ?? undefined}
        />
      )}

      {/* 3D Mockup Preview */}
      <Mockup3DPreview
        open={mockup3dOpen}
        onOpenChange={setMockup3dOpen}
        canvas={canvas}
        cardWidth={finalWidth}
        cardHeight={finalHeight}
      />
    </>
  );
}

