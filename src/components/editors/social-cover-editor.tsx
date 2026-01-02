'use client';

import * as React from 'react';
import * as fabric from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { useToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { 
  Instagram, Facebook, Youtube, Twitter, 
  Smartphone, Monitor, Download, Upload, Type, Image as ImageIcon
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { CanvasContainer } from './canvas-container';

export type SocialPlatform = 'instagram-post' | 'instagram-story' | 'facebook-cover' | 'facebook-post' | 'youtube-thumbnail' | 'twitter-header';

const PLATFORM_SIZES: Record<SocialPlatform, { width: number; height: number; label: string; icon: React.ReactNode }> = {
  'instagram-post': { width: 1080, height: 1080, label: 'Instagram Пост', icon: <Instagram className="h-4 w-4" /> },
  'instagram-story': { width: 1080, height: 1920, label: 'Instagram Story', icon: <Instagram className="h-4 w-4" /> },
  'facebook-cover': { width: 1640, height: 859, label: 'Facebook Обложка', icon: <Facebook className="h-4 w-4" /> },
  'facebook-post': { width: 1200, height: 630, label: 'Facebook Пост', icon: <Facebook className="h-4 w-4" /> },
  'youtube-thumbnail': { width: 1280, height: 720, label: 'YouTube Миниатюра', icon: <Youtube className="h-4 w-4" /> },
  'twitter-header': { width: 1500, height: 500, label: 'Twitter/X Заголовок', icon: <Twitter className="h-4 w-4" /> },
};

export function SocialCoverEditor() {
  const toast = useToast();
  const [platform, setPlatform] = React.useState<SocialPlatform>('instagram-post');
  const [previewMode, setPreviewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const [showMockup, setShowMockup] = React.useState(true);

  const size = PLATFORM_SIZES[platform];

  const {
    canvasRef,
    canvas,
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFabricCanvas({ 
    width: size.width, 
    height: size.height,
    backgroundColor: '#ffffff',
  });

  React.useEffect(() => {
    if (!canvas) return;
    canvas.setWidth(size.width);
    canvas.setHeight(size.height);
    canvas.renderAll();
  }, [canvas, size.width, size.height]);

  const handleAddText = () => {
    if (!canvas) return;
    const text = new fabric.IText('Ваш текст', {
      left: size.width / 2,
      top: size.height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 48,
      fontFamily: 'Arial',
      fill: '#000000',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    saveHistory();
  };

  const handleAddImage = () => {
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
            const scale = Math.min(size.width / (img.width || 1), size.height / (img.height || 1));
            img.scale(scale * 0.9);
            img.set({
              left: size.width / 2,
              top: size.height / 2,
              originX: 'center',
              originY: 'center',
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            saveHistory();
          });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleExport = () => {
    if (!canvas) return;
    exportAsImage(canvas, 'png', `${platform}-${Date.now()}`);
  };

  const getMockupStyle = () => {
    const isVertical = size.height > size.width;
    if (previewMode === 'mobile') {
      return {
        width: isVertical ? '300px' : '400px',
        height: isVertical ? '533px' : '300px',
      };
    }
    return {
      width: isVertical ? '400px' : '600px',
      height: isVertical ? '711px' : '400px',
    };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Обложки соцсетей</h2>
          <p className="text-sm text-muted-foreground">Создавайте контент для соцсетей</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Платформа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={platform} onChange={(e) => setPlatform(e.target.value as SocialPlatform)}>
                {Object.entries(PLATFORM_SIZES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label} ({value.width}×{value.height})
                  </option>
                ))}
              </Select>
              <div className="text-xs text-muted-foreground">
                Размер: {size.width} × {size.height} px
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Инструменты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleAddText}>
                <Type className="mr-2 h-4 w-4" />
                Добавить текст
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleAddImage}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Добавить изображение
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Предпросмотр</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="mr-2 h-4 w-4" />
                Десктоп
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Мобильный
              </Button>
              <Button
                variant={showMockup ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setShowMockup(!showMockup)}
              >
                {showMockup ? 'Скрыть мокап' : 'Показать мокап'}
              </Button>
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

      {/* Основная область */}
      <div className="flex-1 flex items-center justify-center bg-muted p-8 overflow-auto">
        {showMockup ? (
          <div className="relative">
            {/* Мокап устройства */}
            <div 
              className="relative bg-gray-900 rounded-[2rem] p-2 shadow-2xl"
              style={previewMode === 'mobile' ? { width: '320px' } : { width: '600px' }}
            >
              <div className="bg-black rounded-[1.5rem] overflow-hidden">
                <div className="bg-white" style={getMockupStyle()}>
                  <CanvasContainer
                    canvasRef={canvasRef}
                    canvasWidth={size.width}
                    canvasHeight={size.height}
                    showGrid={false}
                    onToggleGrid={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-lg">
            <CanvasContainer
              canvasRef={canvasRef}
              canvasWidth={size.width}
              canvasHeight={size.height}
              showGrid={false}
              onToggleGrid={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}

