'use client';

import { useEffect, useState, useRef } from 'react';

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'processing' | 'completed' | 'error';
  progress: number; // 0-100
  message?: string;
}

/**
 * Хук для получения real-time прогресса генерации через SSE
 */
export function useGenerationProgress(generationId: string | null) {
  const [progress, setProgress] = useState<GenerationProgress>({
    status: 'idle',
    progress: 0,
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!generationId) {
      setProgress({ status: 'idle', progress: 0 });
      return;
    }

    // Создаём SSE соединение
    const eventSource = new EventSource(
      `/api/generate/progress?generationId=${generationId}`
    );

    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress({
          status: data.status,
          progress: data.progress || 0,
          message: data.message,
        });

        // Закрываем соединение при завершении
        if (data.status === 'completed' || data.status === 'error') {
          eventSource.close();
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setProgress({
        status: 'error',
        progress: 0,
        message: 'Ошибка подключения',
      });
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [generationId]);

  return progress;
}

