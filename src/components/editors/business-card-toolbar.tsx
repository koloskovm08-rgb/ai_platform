'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Type,
  Upload,
  QrCode,
  Undo,
  Redo,
  Minus,
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  MessageCircle,
  Palette,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp,
  ArrowDown,
  Printer,
  Download,
  Layers,
  Save,
  FolderOpen,
  FolderPlus,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Paintbrush,
  Eraser,
  Move,
  ZoomIn,
  ZoomOut,
  Hand,
  Copy,
  Group,
  Layers as UngroupIcon,
} from 'lucide-react';
import type { ToolType } from './custom-cursors';

interface ToolbarSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  items: ToolbarItem[];
  defaultOpen?: boolean;
}

interface ToolbarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  toolType?: ToolType;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  badge?: string;
}

interface BusinessCardToolbarProps {
  // История
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Проект
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSave: () => void;
  onSaveAs: () => void;
  onLoadProject: () => void;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved';
  hasSession: boolean;
  
  // Базовые инструменты
  onAddText: () => void;
  onAddLogo: () => void;
  onAddQRCode: () => void;
  
  // Новые инструменты
  onSelectTool?: (tool: ToolType) => void;
  onBrush?: () => void;
  onEraser?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onDuplicate?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  
  // Специализированные
  onAddDivider: (direction: 'horizontal' | 'vertical') => void;
  onAddContactIcon: (type: 'phone' | 'email' | 'address' | 'website') => void;
  onAddSocialIcon: (type: 'instagram' | 'facebook' | 'vk' | 'telegram') => void;
  onAddGradientBackground: (type: 'linear' | 'radial') => void;
  onAddBorder: () => void;
  onAlignSelected: (align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistributeObjects?: (direction: 'horizontal' | 'vertical') => void;
  
  // Шаблоны и экспорт
  onUseTemplate: () => void;
  onPrint: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  
  // Активный инструмент
  activeTool?: ToolType;
  
  className?: string;
}

export function BusinessCardToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  projectName,
  onProjectNameChange,
  onSave,
  onSaveAs,
  onLoadProject,
  isSaving,
  saveStatus,
  hasSession,
  onAddText,
  onAddLogo,
  onAddQRCode,
  onSelectTool,
  onBrush,
  onEraser,
  onZoomIn,
  onZoomOut,
  onDuplicate,
  onGroup,
  onUngroup,
  onAddDivider,
  onAddContactIcon,
  onAddSocialIcon,
  onAddGradientBackground,
  onAddBorder,
  onAlignSelected,
  onDistributeObjects,
  onUseTemplate,
  onPrint,
  onExportPNG,
  onExportPDF,
  activeTool = 'select',
  className,
}: BusinessCardToolbarProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['project', 'basic-tools', 'specialized'])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const sections: ToolbarSection[] = [
    {
      id: 'project',
      title: 'Проект',
      icon: <Layers className="h-4 w-4" />,
      defaultOpen: true,
      items: [],
    },
    {
      id: 'basic-tools',
      title: 'Базовые инструменты',
      icon: <Paintbrush className="h-4 w-4" />,
      defaultOpen: true,
      items: [
        {
          id: 'select',
          label: 'Выделение',
          icon: <Move className="h-4 w-4" />,
          onClick: () => onSelectTool?.('select'),
          toolType: 'select',
        },
        {
          id: 'text',
          label: 'Текст',
          icon: <Type className="h-4 w-4" />,
          onClick: () => {
            onSelectTool?.('text');
            onAddText();
          },
          toolType: 'text',
        },
        {
          id: 'logo',
          label: 'Логотип',
          icon: <Upload className="h-4 w-4" />,
          onClick: onAddLogo,
        },
        {
          id: 'qr',
          label: 'QR-код',
          icon: <QrCode className="h-4 w-4" />,
          onClick: onAddQRCode,
        },
      ],
    },
    {
      id: 'drawing-tools',
      title: 'Рисование',
      icon: <Paintbrush className="h-4 w-4" />,
      items: [
        {
          id: 'brush',
          label: 'Кисть',
          icon: <Paintbrush className="h-4 w-4" />,
          onClick: () => {
            onSelectTool?.('brush');
            onBrush?.();
          },
          toolType: 'brush',
        },
        {
          id: 'eraser',
          label: 'Ластик',
          icon: <Eraser className="h-4 w-4" />,
          onClick: () => {
            onSelectTool?.('eraser');
            onEraser?.();
          },
          toolType: 'eraser',
        },
      ],
    },
    {
      id: 'specialized',
      title: 'Специализированные',
      icon: <Palette className="h-4 w-4" />,
      defaultOpen: true,
      items: [
        {
          id: 'divider-h',
          label: 'Разделитель (гориз.)',
          icon: <Minus className="h-4 w-4" />,
          onClick: () => onAddDivider('horizontal'),
        },
        {
          id: 'divider-v',
          label: 'Разделитель (верт.)',
          icon: <Minus className="h-4 w-4 rotate-90" />,
          onClick: () => onAddDivider('vertical'),
        },
        {
          id: 'gradient-linear',
          label: 'Градиент (линейный)',
          icon: <Palette className="h-4 w-4" />,
          onClick: () => onAddGradientBackground('linear'),
        },
        {
          id: 'gradient-radial',
          label: 'Градиент (радиальный)',
          icon: <Palette className="h-4 w-4" />,
          onClick: () => onAddGradientBackground('radial'),
        },
        {
          id: 'border',
          label: 'Рамка',
          icon: <Square className="h-4 w-4" />,
          onClick: onAddBorder,
        },
      ],
    },
    {
      id: 'contacts',
      title: 'Контакты',
      icon: <Phone className="h-4 w-4" />,
      items: [
        {
          id: 'phone',
          label: 'Телефон',
          icon: <Phone className="h-4 w-4" />,
          onClick: () => onAddContactIcon('phone'),
        },
        {
          id: 'email',
          label: 'Email',
          icon: <Mail className="h-4 w-4" />,
          onClick: () => onAddContactIcon('email'),
        },
        {
          id: 'address',
          label: 'Адрес',
          icon: <MapPin className="h-4 w-4" />,
          onClick: () => onAddContactIcon('address'),
        },
        {
          id: 'website',
          label: 'Сайт',
          icon: <Globe className="h-4 w-4" />,
          onClick: () => onAddContactIcon('website'),
        },
      ],
    },
    {
      id: 'social',
      title: 'Социальные сети',
      icon: <Instagram className="h-4 w-4" />,
      items: [
        {
          id: 'instagram',
          label: 'Instagram',
          icon: <Instagram className="h-4 w-4" />,
          onClick: () => onAddSocialIcon('instagram'),
        },
        {
          id: 'facebook',
          label: 'Facebook',
          icon: <Facebook className="h-4 w-4" />,
          onClick: () => onAddSocialIcon('facebook'),
        },
        {
          id: 'vk',
          label: 'VK',
          icon: <MessageCircle className="h-4 w-4" />,
          onClick: () => onAddSocialIcon('vk'),
        },
        {
          id: 'telegram',
          label: 'Telegram',
          icon: <MessageCircle className="h-4 w-4" />,
          onClick: () => onAddSocialIcon('telegram'),
        },
      ],
    },
    {
      id: 'actions',
      title: 'Действия',
      icon: <Group className="h-4 w-4" />,
      items: [
        {
          id: 'duplicate',
          label: 'Дублировать',
          icon: <Copy className="h-4 w-4" />,
          onClick: () => onDuplicate?.(),
        },
        {
          id: 'group',
          label: 'Группировать',
          icon: <Group className="h-4 w-4" />,
          onClick: () => onGroup?.(),
        },
        {
          id: 'ungroup',
          label: 'Разгруппировать',
          icon: <UngroupIcon className="h-4 w-4" />,
          onClick: () => onUngroup?.(),
        },
        {
          id: 'align-left',
          label: 'Выровнять влево',
          icon: <AlignLeft className="h-4 w-4" />,
          onClick: () => onAlignSelected('left'),
        },
        {
          id: 'align-center',
          label: 'Выровнять по центру',
          icon: <AlignCenter className="h-4 w-4" />,
          onClick: () => onAlignSelected('center'),
        },
        {
          id: 'align-right',
          label: 'Выровнять вправо',
          icon: <AlignRight className="h-4 w-4" />,
          onClick: () => onAlignSelected('right'),
        },
        {
          id: 'align-top',
          label: 'Выровнять сверху',
          icon: <ArrowUp className="h-4 w-4" />,
          onClick: () => onAlignSelected('top'),
        },
        {
          id: 'align-middle',
          label: 'Выровнять по вертикали',
          icon: <Minus className="h-4 w-4 rotate-90" />,
          onClick: () => onAlignSelected('middle'),
        },
        {
          id: 'align-bottom',
          label: 'Выровнять снизу',
          icon: <ArrowDown className="h-4 w-4" />,
          onClick: () => onAlignSelected('bottom'),
        },
        {
          id: 'distribute-horizontal',
          label: 'Распределить по горизонтали',
          icon: <AlignJustify className="h-4 w-4" />,
          onClick: () => onDistributeObjects?.('horizontal'),
        },
        {
          id: 'distribute-vertical',
          label: 'Распределить по вертикали',
          icon: <Minus className="h-4 w-4" />,
          onClick: () => onDistributeObjects?.('vertical'),
        },
      ],
    },
    {
      id: 'view',
      title: 'Вид',
      icon: <ZoomIn className="h-4 w-4" />,
      items: [
        {
          id: 'zoom-in',
          label: 'Увеличить',
          icon: <ZoomIn className="h-4 w-4" />,
          onClick: () => onZoomIn?.(),
        },
        {
          id: 'zoom-out',
          label: 'Уменьшить',
          icon: <ZoomOut className="h-4 w-4" />,
          onClick: () => onZoomOut?.(),
        },
        {
          id: 'hand',
          label: 'Рука',
          icon: <Hand className="h-4 w-4" />,
          onClick: () => onSelectTool?.('hand'),
          toolType: 'hand',
        },
      ],
    },
    {
      id: 'export',
      title: 'Экспорт',
      icon: <Download className="h-4 w-4" />,
      items: [
        {
          id: 'export-png',
          label: 'Экспорт PNG',
          icon: <Download className="h-4 w-4" />,
          onClick: onExportPNG,
        },
        {
          id: 'export-pdf',
          label: 'Экспорт PDF',
          icon: <Download className="h-4 w-4" />,
          onClick: onExportPDF,
        },
        {
          id: 'print',
          label: 'Печать',
          icon: <Printer className="h-4 w-4" />,
          onClick: onPrint,
        },
      ],
    },
  ];

  const renderSection = (section: ToolbarSection) => {
    const isExpanded = expandedSections.has(section.id);
    const hasItems = section.items.length > 0;

    return (
      <Card
        key={section.id}
        className={cn(
          'overflow-hidden transition-all duration-300',
          'hover:shadow-lg hover:border-primary/20',
          'animate-slide-in'
        )}
        style={{ animationDelay: `${sections.indexOf(section) * 50}ms` }}
      >
        <CardHeader
          className={cn(
            'cursor-pointer select-none',
            'transition-colors duration-200',
            'hover:bg-muted/50'
          )}
          onClick={() => hasItems && toggleSection(section.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {section.icon && (
                <div className="text-primary">{section.icon}</div>
              )}
              <CardTitle className="text-base font-semibold">
                {section.title}
              </CardTitle>
            </div>
            {hasItems && (
              <div className="text-muted-foreground transition-transform duration-200">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        </CardHeader>
        {hasItems && (
          <CardContent
            className={cn(
              'transition-all duration-300 ease-in-out',
              isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            )}
          >
            <div className="space-y-2 pt-2">
              {section.items.map((item) => {
                const isActive = item.toolType === activeTool;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : item.variant || 'outline'}
                    size="sm"
                    className={cn(
                      'w-full justify-start transition-all duration-200',
                      'hover:scale-[1.02] hover:shadow-md',
                      'active:scale-[0.98]',
                      isActive && 'ring-2 ring-primary ring-offset-2',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={item.onClick}
                    disabled={item.disabled}
                  >
                    <span
                      className={cn(
                        'mr-2 transition-transform duration-200',
                        isActive && 'scale-110'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/20 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        )}
        {section.id === 'project' && (
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Название проекта</Label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Название проекта"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={onSave}
                disabled={isSaving || !hasSession}
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
                className="transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={onSaveAs}
                disabled={!hasSession}
                title="Сохранить как"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={onLoadProject}
              disabled={!hasSession}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Загрузить проект
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={onUseTemplate}
            >
              <Layers className="mr-2 h-4 w-4" />
              Использовать шаблон
            </Button>
          </CardContent>
        )}
        {section.id === 'basic-tools' && (
          <CardContent className="pt-0">
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={onUndo}
                disabled={!canUndo}
                title="Отменить (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={onRedo}
                disabled={!canRedo}
                title="Вернуть (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className={cn('space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar', className)}>
      {sections.map(renderSection)}
    </div>
  );
}

