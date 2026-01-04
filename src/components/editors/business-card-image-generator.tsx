'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Wand2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/toaster';
import type { GenerateImageInput } from '@/lib/utils/validation';
import Image from 'next/image';

interface BusinessCardImageGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageGenerated: (imageUrl: string) => void;
}

export function BusinessCardImageGenerator({
  open,
  onOpenChange,
  onImageGenerated,
}: BusinessCardImageGeneratorProps) {
  const toast = useToast();
  const [prompt, setPrompt] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedImages, setGeneratedImages] = React.useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Введите описание изображения');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const data: GenerateImageInput = {
        prompt: prompt.trim(),
        model: 'STABLE_DIFFUSION',
        width: 1024,
        height: 1024,
        numOutputs: 1,
        guidanceScale: 7.5,
        steps: 50,
        contentType: 'business-card', // Указываем тип контента - визитка
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка генерации');
      }

      if (result.generations && result.generations.length > 0) {
        const imageUrls = result.generations.map((g: any) => g.imageUrl);
        setGeneratedImages(imageUrls);
        toast.success('Изображение для визитки успешно сгенерировано!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImage = (imageUrl: string) => {
    onImageGenerated(imageUrl);
    onOpenChange(false);
    toast.success('Изображение добавлено на визитку');
  };

  const handleClose = () => {
    setPrompt('');
    setGeneratedImages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Генерация изображения для визитки
          </DialogTitle>
          <DialogDescription>
            Опишите, какое изображение вы хотите добавить на визитку. ИИ автоматически создаст профессиональный дизайн, подходящий для визиток.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Поле ввода промпта */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Описание изображения</Label>
            <Input
              id="prompt"
              placeholder="Например: абстрактный геометрический паттерн в синих тонах"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              💡 Совет: Опишите стиль, цвета и настроение. ИИ автоматически адаптирует изображение для визитки.
            </p>
          </div>

          {/* Примеры промптов */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Примеры:</Label>
            <div className="flex flex-wrap gap-2">
              {[
                'минималистичный геометрический паттерн',
                'элегантный золотой орнамент',
                'современный градиент в корпоративных цветах',
                'абстрактные линии и формы',
              ].map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* Кнопка генерации */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Генерация изображения...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Сгенерировать изображение
              </>
            )}
          </Button>

          {/* Результаты генерации */}
          {generatedImages.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <Label>Сгенерированные изображения</Label>
              <div className="grid grid-cols-1 gap-4">
                {generatedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border bg-muted/20"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={imageUrl}
                        alt={`Сгенерированное изображение ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3 bg-background/95 backdrop-blur-sm">
                      <Button
                        onClick={() => handleUseImage(imageUrl)}
                        className="w-full"
                        size="sm"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Использовать это изображение
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Информация */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Автоматическая оптимизация:</strong> ИИ автоматически создаёт изображение в профессиональном стиле, подходящем для визиток — чистый дизайн, современная типографика и корпоративная эстетика.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

