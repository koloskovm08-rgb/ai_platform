'use client';

import * as React from 'react';
import * as fabric from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { useToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Presentation, Plus, Trash2, Download, Type, 
  Image as ImageIcon, ChevronLeft, ChevronRight, Play
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { CanvasContainer } from './canvas-container';

interface Slide {
  id: string;
  title: string;
  content: string;
}

export function PresentationEditor() {
  const toast = useToast();
  
  const [slides, setSlides] = React.useState<Slide[]>([
    { id: '1', title: 'Слайд 1', content: 'Заголовок презентации' },
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const width = 1920;
  const height = 1080;

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
    backgroundColor: '#ffffff',
  });

  React.useEffect(() => {
    if (!canvas) return;
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.renderAll();
  }, [canvas, width, height]);

  React.useEffect(() => {
    if (!canvas) return;
    loadSlideToCanvas(slides[currentSlideIndex]);
  }, [canvas, currentSlideIndex, slides]);

  const loadSlideToCanvas = (slide: Slide) => {
    if (!canvas) return;
    
    // Очищаем canvas
    const objects = canvas.getObjects();
    objects.forEach(obj => canvas.remove(obj));

    // Заголовок
    const title = new fabric.IText(slide.title, {
      left: width / 2,
      top: 150,
      originX: 'center',
      originY: 'center',
      fontSize: 64,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#1a1a1a',
    });
    canvas.add(title);

    // Содержимое
    if (slide.content) {
      const content = new fabric.IText(slide.content, {
        left: width / 2,
        top: height / 2,
        originX: 'center',
        originY: 'center',
        fontSize: 36,
        fontFamily: 'Arial',
        fill: '#333333',
        width: width - 200,
      });
      canvas.add(content);
    }

    canvas.renderAll();
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Слайд ${slides.length + 1}`,
      content: 'Содержимое слайда',
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) {
      toast.error('Должен быть хотя бы один слайд');
      return;
    }
    const newSlides = slides.filter(s => s.id !== id);
    setSlides(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
  };

  const handleUpdateSlide = (id: string, field: keyof Slide, value: string) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    ));
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleExportAll = () => {
    if (!canvas) return;
    slides.forEach((slide, index) => {
      loadSlideToCanvas(slide);
      setTimeout(() => {
        exportAsImage(canvas, 'png', `slide-${index + 1}-${Date.now()}`);
      }, index * 500);
    });
    toast.success('Все слайды экспортированы');
  };

  const handleExportCurrent = () => {
    if (!canvas) return;
    exportAsImage(canvas, 'png', `slide-${currentSlideIndex + 1}-${Date.now()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редактор презентаций</h2>
          <p className="text-sm text-muted-foreground">Создавайте слайды</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Слайды</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleAddSlide}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    index === currentSlideIndex ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Слайд {index + 1}</span>
                    {slides.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(slide.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={slide.title}
                    onChange={(e) => handleUpdateSlide(slide.id, 'title', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mb-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Текущий слайд</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Заголовок</Label>
                <Input
                  value={slides[currentSlideIndex]?.title || ''}
                  onChange={(e) => handleUpdateSlide(slides[currentSlideIndex]?.id || '', 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Содержимое</Label>
                <textarea
                  value={slides[currentSlideIndex]?.content || ''}
                  onChange={(e) => handleUpdateSlide(slides[currentSlideIndex]?.id || '', 'content', e.target.value)}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Навигация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handlePrevSlide} disabled={currentSlideIndex === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleNextSlide} disabled={currentSlideIndex === slides.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {currentSlideIndex + 1} / {slides.length}
              </div>
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
            <CardContent className="space-y-2">
              <Button variant="default" className="w-full" onClick={handleExportCurrent}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт текущего
              </Button>
              <Button variant="outline" className="w-full" onClick={handleExportAll}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт всех
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-muted p-4 overflow-auto">
        <div className="bg-white shadow-2xl" style={{ transform: 'scale(0.5)', transformOrigin: 'center' }}>
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

