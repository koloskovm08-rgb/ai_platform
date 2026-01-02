'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Save,
  FolderOpen,
  FolderPlus,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  Users,
  Sparkles,
  Settings,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Type,
  Bold,
  Italic,
  Underline,
  Palette,
  Upload,
  Crop,
  Image as ImageIcon,
  Filter,
  Square,
  Circle,
  Triangle,
  PenTool,
  QrCode,
  Layers,
  Layout,
  Palette as PaletteIcon,
  Wand2,
  Sparkles as SparklesIcon,
  ImagePlus,
  FileImage,
  Check,
  Loader2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToolbarSection } from './toolbar-section';
import { ToolbarTool } from './toolbar-tool';
import { useEditorToolbarStore } from '@/stores/editor-toolbar-store';
import type { ToolType } from '@/components/editors/custom-cursors';

interface ModernToolbarProps {
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

  // Инструменты
  onSelectTool?: (tool: ToolType) => void;
  onAddText: () => void;
  onAddLogo: () => void;
  onAddQRCode: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  onShare?: () => void;
  onCollaborate?: () => void;

  // Transform
  onMove?: () => void;
  onRotate?: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;

  // Text
  onTextBold?: () => void;
  onTextItalic?: () => void;
  onTextUnderline?: () => void;
  onChangeTextColor?: () => void;

  // Image
  onImageUpload?: () => void;
  onImageCrop?: () => void;
  onImageRemoveBg?: () => void;
  onImageFilters?: () => void;

  // Shapes
  onAddRectangle?: () => void;
  onAddCircle?: () => void;
  onAddTriangle?: () => void;
  onPenTool?: () => void;

  // AI Suggestions
  onAILayoutIdeas?: () => void;
  onAIColorPalette?: () => void;
  onAITextAssist?: () => void;
  onAIImageEnhancement?: () => void;
  onAIPrintLayout?: () => void;

  // Export
  onExportPNG?: () => void;
  onExportPDF?: () => void;
  onExportSVG?: () => void;
  onMockup3D?: () => void;

  // Расширенные инструменты
  smartGuidesEnabled?: boolean;
  onToggleSmartGuides?: (enabled: boolean) => void;
  snapToGridEnabled?: boolean;
  gridVisible?: boolean;
  onToggleSnapToGrid?: (enabled: boolean, showGrid?: boolean) => void;

  // Активный инструмент
  activeTool?: ToolType;
  className?: string;
}

export function ModernToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onSaveAs,
  onLoadProject,
  isSaving,
  saveStatus,
  hasSession,
  onSelectTool,
  onAddText,
  onAddLogo,
  onAddQRCode,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onShare,
  onCollaborate,
  onMove,
  onRotate,
  onFlipHorizontal,
  onFlipVertical,
  onTextBold,
  onTextItalic,
  onTextUnderline,
  onChangeTextColor,
  onImageUpload,
  onImageCrop,
  onImageRemoveBg,
  onImageFilters,
  onAddRectangle,
  onAddCircle,
  onAddTriangle,
  onPenTool,
  onAILayoutIdeas,
  onAIColorPalette,
  onAITextAssist,
  onAIImageEnhancement,
  onAIPrintLayout,
  onExportPNG,
  onExportPDF,
  onExportSVG,
  onMockup3D,
  activeTool = 'select',
  className,
}: ModernToolbarProps) {
  const { mode, setMode, isCollapsed, toggleCollapsed } = useEditorToolbarStore();

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 60, opacity: 1 }}
        className="fixed left-0 top-0 h-screen bg-[#1F1F1F] border-r border-white/10 z-50 flex flex-col items-center py-4"
      >
        <button
          onClick={toggleCollapsed}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Settings className="h-5 w-5 text-white/70" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed left-0 top-0 h-screen w-[280px]',
        'bg-[#1F1F1F] border-r border-white/10',
        'backdrop-blur-md bg-opacity-95',
        'overflow-y-auto overflow-x-hidden',
        'z-50',
        'custom-scrollbar-dark',
        className
      )}
      style={{
        background: 'linear-gradient(180deg, rgba(31, 31, 31, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
      }}
    >
      {/* Заголовок и переключатель режима */}
      <div className="sticky top-0 z-10 bg-[#1F1F1F]/95 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Инструменты</h2>
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Settings className="h-4 w-4 text-white/70" />
          </button>
        </div>

        {/* Переключатель Manual / AI Assist */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
          <button
            onClick={() => setMode('manual')}
            className={cn(
              'flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              mode === 'manual'
                ? 'bg-primary text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            )}
          >
            Manual
          </button>
          <button
            onClick={() => setMode('ai')}
            className={cn(
              'flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              mode === 'ai'
                ? 'bg-primary text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            )}
          >
            <span className="flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Assist
            </span>
          </button>
        </div>
      </div>

      {/* Контент панели */}
      <div className="p-4 space-y-3">
        {/* File Section */}
        <ToolbarSection id="file" title="Файл" icon={<FileText className="h-4 w-4" />}>
          <div className="space-y-1">
            <ToolbarTool
              id="save"
              label="Сохранить"
              icon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveStatus === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              onClick={onSave}
              shortcut="Ctrl+S"
              description="Сохранить проект"
              disabled={isSaving || !hasSession}
              isActive={false}
            />
            <ToolbarTool
              id="save-as"
              label="Сохранить как"
              icon={<FolderPlus className="h-4 w-4" />}
              onClick={onSaveAs}
              shortcut="Ctrl+Shift+S"
              description="Сохранить как новый проект"
              disabled={!hasSession}
            />
            <ToolbarTool
              id="load"
              label="Загрузить"
              icon={<FolderOpen className="h-4 w-4" />}
              onClick={onLoadProject}
              shortcut="Ctrl+O"
              description="Загрузить проект"
              disabled={!hasSession}
            />
          </div>
        </ToolbarSection>

        {/* History Section */}
        <ToolbarSection id="history" title="История" icon={<Undo className="h-4 w-4" />}>
          <div className="flex gap-1">
            <ToolbarTool
              id="undo"
              label="Отменить"
              icon={<Undo className="h-4 w-4" />}
              onClick={onUndo}
              shortcut="Ctrl+Z"
              description="Отменить последнее действие"
              disabled={!canUndo}
              className="flex-1"
            />
            <ToolbarTool
              id="redo"
              label="Вернуть"
              icon={<Redo className="h-4 w-4" />}
              onClick={onRedo}
              shortcut="Ctrl+Y"
              description="Вернуть отмененное действие"
              disabled={!canRedo}
              className="flex-1"
            />
          </div>
        </ToolbarSection>

        {/* View Section */}
        <ToolbarSection id="view" title="Вид" icon={<ZoomIn className="h-4 w-4" />}>
          <div className="space-y-1">
            <ToolbarTool
              id="zoom-in"
              label="Увеличить"
              icon={<ZoomIn className="h-4 w-4" />}
              onClick={() => onZoomIn?.()}
              shortcut="Ctrl++"
              description="Увеличить масштаб"
            />
            <ToolbarTool
              id="zoom-out"
              label="Уменьшить"
              icon={<ZoomOut className="h-4 w-4" />}
              onClick={() => onZoomOut?.()}
              shortcut="Ctrl+-"
              description="Уменьшить масштаб"
            />
            <ToolbarTool
              id="zoom-fit"
              label="По размеру"
              icon={<Maximize2 className="h-4 w-4" />}
              onClick={() => onZoomFit?.()}
              shortcut="Ctrl+0"
              description="Подогнать под размер экрана"
            />
          </div>
        </ToolbarSection>

        {/* Collaboration Section */}
        <ToolbarSection id="collaboration" title="Совместная работа" icon={<Users className="h-4 w-4" />}>
          <div className="space-y-1">
            <ToolbarTool
              id="share"
              label="Поделиться"
              icon={<Share2 className="h-4 w-4" />}
              onClick={() => onShare?.()}
              shortcut="Ctrl+Shift+S"
              description="Поделиться проектом"
            />
            <ToolbarTool
              id="collaborate"
              label="Коллаборация"
              icon={<Users className="h-4 w-4" />}
              onClick={() => onCollaborate?.()}
              description="Начать совместную работу"
            />
          </div>
        </ToolbarSection>

        {/* Transform Section */}
        <ToolbarSection id="transform" title="Трансформация" icon={<Move className="h-4 w-4" />}>
          <div className="space-y-1">
            <ToolbarTool
              id="select"
              label="Выделение"
              icon={<Move className="h-4 w-4" />}
              onClick={() => onSelectTool?.('select')}
              shortcut="V"
              description="Инструмент выделения"
              isActive={activeTool === 'select'}
            />
            <ToolbarTool
              id="move"
              label="Переместить"
              icon={<Move className="h-4 w-4" />}
              onClick={() => onMove?.()}
              shortcut="M"
              description="Переместить объект"
            />
            <ToolbarTool
              id="rotate"
              label="Повернуть"
              icon={<RotateCw className="h-4 w-4" />}
              onClick={() => onRotate?.()}
              shortcut="R"
              description="Повернуть объект"
            />
            <div className="flex gap-1">
              <ToolbarTool
                id="flip-h"
                label="Отразить (Г)"
                icon={<FlipHorizontal className="h-4 w-4" />}
                onClick={() => onFlipHorizontal?.()}
                description="Отразить по горизонтали"
                className="flex-1"
              />
              <ToolbarTool
                id="flip-v"
                label="Отразить (В)"
                icon={<FlipVertical className="h-4 w-4" />}
                onClick={() => onFlipVertical?.()}
                description="Отразить по вертикали"
                className="flex-1"
              />
            </div>
          </div>
        </ToolbarSection>

        {/* Text Tools Section */}
        <ToolbarSection id="text" title="Текст" icon={<Type className="h-4 w-4" />}>
          <div className="space-y-1">
            <ToolbarTool
              id="text-add"
              label="Добавить текст"
              icon={<Type className="h-4 w-4" />}
              onClick={onAddText}
              shortcut="T"
              description="Добавить текстовый элемент"
              isActive={activeTool === 'text'}
            />
            <div className="flex gap-1">
              <ToolbarTool
                id="text-bold"
                label="Жирный"
                icon={<Bold className="h-4 w-4" />}
                onClick={() => onTextBold?.()}
                shortcut="Ctrl+B"
                description="Сделать текст жирным"
                className="flex-1"
              />
              <ToolbarTool
                id="text-italic"
                label="Курсив"
                icon={<Italic className="h-4 w-4" />}
                onClick={() => onTextItalic?.()}
                shortcut="Ctrl+I"
                description="Сделать текст курсивом"
                className="flex-1"
              />
              <ToolbarTool
                id="text-underline"
                label="Подчеркнуть"
                icon={<Underline className="h-4 w-4" />}
                onClick={() => onTextUnderline?.()}
                shortcut="Ctrl+U"
                description="Подчеркнуть текст"
                className="flex-1"
              />
            </div>
            <ToolbarTool
              id="text-color"
              label="Цвет текста"
              icon={<Palette className="h-4 w-4" />}
              onClick={() => onChangeTextColor?.()}
              description="Изменить цвет текста"
            />
          </div>
        </ToolbarSection>

        {/* Image Tools Section */}
        <ToolbarSection id="image" title="Изображения" icon={<ImageIcon className="h-4 w-4" />}>
          <div className="space-y-1">
            <ToolbarTool
              id="image-upload"
              label="Загрузить"
              icon={<Upload className="h-4 w-4" />}
              onClick={() => onImageUpload?.() || onAddLogo()}
              shortcut="Ctrl+U"
              description="Загрузить изображение"
            />
            <ToolbarTool
              id="image-crop"
              label="Обрезать"
              icon={<Crop className="h-4 w-4" />}
              onClick={() => onImageCrop?.()}
              shortcut="C"
              description="Обрезать изображение"
            />
            <ToolbarTool
              id="image-remove-bg"
              label="Убрать фон"
              icon={<ImagePlus className="h-4 w-4" />}
              onClick={() => onImageRemoveBg?.()}
              description="Автоматически убрать фон"
              badge="AI"
            />
            <ToolbarTool
              id="image-filters"
              label="Фильтры"
              icon={<Filter className="h-4 w-4" />}
              onClick={() => onImageFilters?.()}
              description="Применить фильтры"
            />
          </div>
        </ToolbarSection>

        {/* Shapes & Elements Section */}
        <ToolbarSection id="shapes" title="Фигуры" icon={<Square className="h-4 w-4" />}>
          <div className="space-y-1">
            <div className="flex gap-1">
              <ToolbarTool
                id="shape-rectangle"
                label="Прямоугольник"
                icon={<Square className="h-4 w-4" />}
                onClick={() => onAddRectangle?.()}
                shortcut="R"
                description="Добавить прямоугольник"
                className="flex-1"
              />
              <ToolbarTool
                id="shape-circle"
                label="Круг"
                icon={<Circle className="h-4 w-4" />}
                onClick={() => onAddCircle?.()}
                shortcut="O"
                description="Добавить круг"
                className="flex-1"
              />
              <ToolbarTool
                id="shape-triangle"
                label="Треугольник"
                icon={<Triangle className="h-4 w-4" />}
                onClick={() => onAddTriangle?.()}
                description="Добавить треугольник"
                className="flex-1"
              />
            </div>
            <ToolbarTool
              id="pen-tool"
              label="Перо"
              icon={<PenTool className="h-4 w-4" />}
              onClick={() => onPenTool?.()}
              shortcut="P"
              description="Инструмент перо для рисования"
            />
            <ToolbarTool
              id="qr-code"
              label="QR-код"
              icon={<QrCode className="h-4 w-4" />}
              onClick={onAddQRCode}
              description="Добавить QR-код"
            />
          </div>
        </ToolbarSection>

        {/* Export Section */}
        <ToolbarSection id="export" title="Экспорт" icon={<Download className="h-4 w-4" />}>
          <div className="space-y-1">
            <ToolbarTool
              id="export-png"
              label="Экспорт PNG"
              icon={<Download className="h-4 w-4" />}
              onClick={() => onExportPNG?.()}
              shortcut="Ctrl+E"
              description="Экспортировать как PNG"
            />
            <ToolbarTool
              id="export-pdf"
              label="Экспорт PDF"
              icon={<Download className="h-4 w-4" />}
              onClick={() => onExportPDF?.()}
              description="Экспортировать как PDF"
            />
            <ToolbarTool
              id="export-svg"
              label="Экспорт SVG"
              icon={<Download className="h-4 w-4" />}
              onClick={() => {}}
              description="Экспортировать как SVG"
            />
            <ToolbarTool
              id="mockup-3d"
              label="3D Mockup"
              icon={<Layers className="h-4 w-4" />}
              onClick={() => {}}
              description="Показать 3D превью"
            />
          </div>
        </ToolbarSection>

        {/* Export Section */}
        <ToolbarSection id="export" title="Экспорт" icon={<Download className="h-4 w-4" />}>
          <div className="space-y-1">
            <ToolbarTool
              id="export-png"
              label="Экспорт PNG"
              icon={<Download className="h-4 w-4" />}
              onClick={() => onExportPNG?.()}
              shortcut="Ctrl+E"
              description="Экспортировать как PNG"
            />
            <ToolbarTool
              id="export-pdf"
              label="Экспорт PDF"
              icon={<Download className="h-4 w-4" />}
              onClick={() => onExportPDF?.()}
              description="Экспортировать как PDF"
            />
            <ToolbarTool
              id="export-svg"
              label="Экспорт SVG"
              icon={<Download className="h-4 w-4" />}
              onClick={() => onExportSVG?.()}
              description="Экспортировать как SVG"
            />
            <ToolbarTool
              id="mockup-3d"
              label="3D Mockup"
              icon={<Layers className="h-4 w-4" />}
              onClick={() => onMockup3D?.()}
              description="Показать 3D превью"
            />
          </div>
        </ToolbarSection>

        {/* AI Suggestions Section */}
        <ToolbarSection
          id="ai-suggestions"
          title="AI Предложения"
          icon={<SparklesIcon className="h-4 w-4" />}
          defaultOpen={mode === 'ai'}
        >
          <div className="space-y-1">
            <ToolbarTool
              id="ai-layout"
              label="Идеи макета"
              icon={<Layout className="h-4 w-4" />}
              onClick={() => onAILayoutIdeas?.()}
              description="AI предложит варианты макета"
              badge="AI"
              variant="primary"
            />
            <ToolbarTool
              id="ai-color"
              label="Цветовая палитра"
              icon={<PaletteIcon className="h-4 w-4" />}
              onClick={() => onAIColorPalette?.()}
              description="AI подберет цветовую палитру"
              badge="AI"
              variant="primary"
            />
            <ToolbarTool
              id="ai-text"
              label="Помощник текста"
              icon={<Wand2 className="h-4 w-4" />}
              onClick={() => onAITextAssist?.()}
              description="AI поможет с текстом"
              badge="AI"
              variant="primary"
            />
            <ToolbarTool
              id="ai-image"
              label="Улучшение изображения"
              icon={<FileImage className="h-4 w-4" />}
              onClick={() => onAIImageEnhancement?.()}
              description="AI улучшит изображение"
              badge="AI"
              variant="primary"
            />
            <ToolbarTool
              id="ai-print"
              label="Макет для печати"
              icon={<Layers className="h-4 w-4" />}
              onClick={() => onAIPrintLayout?.()}
              description="AI оптимизирует для печати"
              badge="AI"
              variant="primary"
            />
          </div>
        </ToolbarSection>
      </div>
    </motion.div>
  );
}

