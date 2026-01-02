'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Loader2, Plus, X, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

// Схема валидации
const batchGenerationSchema = z.object({
  prompts: z.array(z.string().min(3, 'Промпт слишком короткий')).min(1, 'Добавьте хотя бы один промпт').max(10, 'Максимум 10 промптов'),
  model: z.enum(['STABLE_DIFFUSION', 'DALL_E_3']),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  negativePrompt: z.string().optional(),
});

type BatchGenerationFormData = z.infer<typeof batchGenerationSchema>;

interface BatchResult {
  success: boolean;
  prompt: string;
  generation?: {
    id: string;
    imageUrl: string;
    prompt: string;
    [key: string]: unknown;
  };
  error?: string;
}

/**
 * Форма batch-генерации изображений
 * Позволяет ввести несколько промптов и генерировать все одновременно
 */
export function BatchGenerationForm() {
  const router = useRouter();
  const [prompts, setPrompts] = React.useState<string[]>(['']);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState({ current: 0, total: 0 });
  const [results, setResults] = React.useState<BatchResult[]>([]);
  const [showResults, setShowResults] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<BatchGenerationFormData>({
    resolver: zodResolver(batchGenerationSchema),
    defaultValues: {
      model: 'STABLE_DIFFUSION',
      width: 1024,
      height: 1024,
      negativePrompt: '',
    },
  });

  const model = watch('model');

  // Добавить промпт
  const addPrompt = () => {
    if (prompts.length < 10) {
      setPrompts([...prompts, '']);
    }
  };

  // Удалить промпт
  const removePrompt = (index: number) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter((_, i) => i !== index));
    }
  };

  // Обновить промпт
  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const onSubmit = async (data: Omit<BatchGenerationFormData, 'prompts'>) => {
    // Фильтруем пустые промпты
    const validPrompts = prompts.filter((p) => p.trim().length >= 3);

    if (validPrompts.length === 0) {
      alert('Добавьте хотя бы один промпт (минимум 3 символа)');
      return;
    }

    if (validPrompts.length > 10) {
      alert('Максимум 10 промптов за раз');
      return;
    }

    try {
      setIsGenerating(true);
      setProgress({ current: 0, total: validPrompts.length });
      setResults([]);
      setShowResults(false);

      const response = await fetch('/api/generate/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          prompts: validPrompts,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка генерации');
      }

      setResults(result.generations || []);
      setProgress({ current: result.successful, total: result.total });
      setShowResults(true);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Не удалось выполнить генерацию');
    } finally {
      setIsGenerating(false);
    }
  };

  // Прогресс в процентах
  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Промпты */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">
                Промпты ({prompts.length}/10)
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addPrompt}
                disabled={prompts.length >= 10 || isGenerating}
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            </div>

            <div className="space-y-3">
              {prompts.map((prompt, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Промпт #${index + 1}: Опишите что хотите сгенерировать...`}
                      value={prompt}
                      onChange={(e) => updatePrompt(index, e.target.value)}
                      disabled={isGenerating}
                      className="min-h-[80px]"
                    />
                  </div>
                  {prompts.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removePrompt(index)}
                      disabled={isGenerating}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Модель */}
          <div className="space-y-2">
            <Label htmlFor="model">AI Модель</Label>
            <Select id="model" {...register('model')} disabled={isGenerating}>
              <option value="STABLE_DIFFUSION">Stable Diffusion (Универсальная)</option>
              <option value="DALL_E_3">DALL-E 3 (Высокое качество)</option>
            </Select>
          </div>

          {/* Размер */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Ширина</Label>
              <Select
                id="width"
                {...register('width', { valueAsNumber: true })}
                disabled={isGenerating || model === 'DALL_E_3'}
              >
                <option value="512">512px</option>
                <option value="768">768px</option>
                <option value="1024">1024px</option>
                {model !== 'DALL_E_3' && <option value="1280">1280px</option>}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Высота</Label>
              <Select
                id="height"
                {...register('height', { valueAsNumber: true })}
                disabled={isGenerating || model === 'DALL_E_3'}
              >
                <option value="512">512px</option>
                <option value="768">768px</option>
                <option value="1024">1024px</option>
                {model !== 'DALL_E_3' && <option value="1280">1280px</option>}
              </Select>
            </div>
          </div>

          {/* Negative Prompt (только для SD) */}
          {model === 'STABLE_DIFFUSION' && (
            <div className="space-y-2">
              <Label htmlFor="negativePrompt">Негативный промпт (опционально)</Label>
              <Textarea
                id="negativePrompt"
                placeholder="Что не должно быть на изображении..."
                {...register('negativePrompt')}
                disabled={isGenerating}
              />
            </div>
          )}

          {/* Кнопка генерации */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Генерация {progress.current}/{progress.total}...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Сгенерировать все ({prompts.filter((p) => p.trim().length >= 3).length})
              </>
            )}
          </Button>

          {/* Прогресс-бар */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Генерация {progress.current} из {progress.total}...
              </p>
            </div>
          )}
        </form>
      </Card>

      {/* Результаты */}
      {showResults && results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Результаты генерации
          </h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">
                      {result.prompt}
                    </p>
                    {result.error && (
                      <p className="text-xs text-red-600 mt-1">{result.error}</p>
                    )}
                    {result.success && result.generation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Успешно сгенерировано!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Действия */}
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => router.push('/generate')}
              className="flex-1"
            >
              Посмотреть результаты
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowResults(false);
                setResults([]);
                setPrompts(['']);
              }}
              className="flex-1"
            >
              Новая генерация
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

