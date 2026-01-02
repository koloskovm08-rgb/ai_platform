'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateImageSchema, type GenerateImageInput } from '@/lib/utils/validation';
import { promptStyles, promptPresets, enhancePrompt, getCategories } from '@/lib/utils/prompts';

interface GenerationFormProps {
  onGenerate: (data: GenerateImageInput) => Promise<void>;
  isLoading?: boolean;
}

export const GenerationForm = React.memo(function GenerationForm({ onGenerate, isLoading }: GenerationFormProps) {
  const [selectedStyle, setSelectedStyle] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerateImageInput>({
    resolver: zodResolver(generateImageSchema),
    defaultValues: {
      model: 'STABLE_DIFFUSION',
      width: 1024,
      height: 1024,
      numOutputs: 1,
      guidanceScale: 7.5,
      steps: 50,
    },
  });

  const prompt = watch('prompt');
  const model = watch('model');

  const onSubmit = async (data: GenerateImageInput) => {
    // Применить стиль к промпту
    if (selectedStyle) {
      const enhanced = enhancePrompt(data.prompt, selectedStyle);
      data.prompt = enhanced.prompt;
      data.negativePrompt = enhanced.negativePrompt;
    }

    await onGenerate(data);
  };

  const applyPreset = (presetId: string) => {
    const preset = promptPresets.find((p) => p.id === presetId);
    if (preset) {
      setValue('prompt', preset.prompt);
      if (preset.negativePrompt) {
        setValue('negativePrompt', preset.negativePrompt);
      }
    }
  };

  const categories = getCategories();
  const filteredPresets = selectedCategory
    ? promptPresets.filter((p) => p.category === selectedCategory)
    : promptPresets;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Модель AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Модель AI
          </CardTitle>
          <CardDescription>
            Выберите AI-модель для генерации изображения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                value="STABLE_DIFFUSION"
                {...register('model')}
                className="h-4 w-4"
              />
              <div>
                <div className="font-medium">Stable Diffusion</div>
                <div className="text-xs text-muted-foreground">
                  Гибкие настройки, высокое качество
                </div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                value="DALL_E_3"
                {...register('model')}
                className="h-4 w-4"
              />
              <div>
                <div className="font-medium">DALL-E 3</div>
                <div className="text-xs text-muted-foreground">
                  Понимает сложные промпты
                </div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Промпт */}
      <Card>
        <CardHeader>
          <CardTitle>Описание изображения</CardTitle>
          <CardDescription>
            Опишите, что вы хотите создать. Чем подробнее, тем лучше!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Категории и пресеты */}
          <div className="space-y-2">
            <Label>Быстрый старт (опционально)</Label>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Все категории</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Select onChange={(e) => applyPreset(e.target.value)}>
                <option value="">Выбрать пресет...</option>
                {filteredPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Поле промпта */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Промпт *</Label>
            <Textarea
              id="prompt"
              placeholder="Например: A majestic dragon flying over snowy mountains at sunset..."
              {...register('prompt')}
              rows={4}
              className={errors.prompt ? 'border-destructive' : ''}
            />
            {errors.prompt && (
              <p className="text-sm text-destructive">{errors.prompt.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Символов: {prompt?.length || 0}
            </p>
          </div>

          {/* Стиль */}
          <div className="space-y-2">
            <Label>Стиль (опционально)</Label>
            <Select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
              <option value="">Без стиля</option>
              {promptStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Автоматически улучшит промпт для выбранного стиля
            </p>
          </div>

          {/* Негативный промпт */}
          {model === 'STABLE_DIFFUSION' && (
            <div className="space-y-2">
              <Label htmlFor="negativePrompt">Негативный промпт (опционально)</Label>
              <Textarea
                id="negativePrompt"
                placeholder="Что НЕ должно быть на изображении..."
                {...register('negativePrompt')}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Укажите, чего следует избегать (например: blurry, low quality, distorted)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Настройки */}
      {model === 'STABLE_DIFFUSION' && (
        <Card>
          <CardHeader>
            <CardTitle>Дополнительные настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Ширина (px)</Label>
                <Input
                  id="width"
                  type="number"
                  {...register('width', { valueAsNumber: true })}
                  step={64}
                  min={256}
                  max={2048}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Высота (px)</Label>
                <Input
                  id="height"
                  type="number"
                  {...register('height', { valueAsNumber: true })}
                  step={64}
                  min={256}
                  max={2048}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guidanceScale">
                Guidance Scale: {watch('guidanceScale')}
              </Label>
              <input
                id="guidanceScale"
                type="range"
                {...register('guidanceScale', { valueAsNumber: true })}
                min={1}
                max={20}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Насколько строго следовать промпту (7-10 оптимально)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps">Шаги: {watch('steps')}</Label>
              <input
                id="steps"
                type="range"
                {...register('steps', { valueAsNumber: true })}
                min={10}
                max={150}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Больше шагов = выше качество, но дольше генерация (30-50 оптимально)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопка генерации */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Генерация...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Сгенерировать изображение
          </>
        )}
      </Button>
    </form>
  );
});

