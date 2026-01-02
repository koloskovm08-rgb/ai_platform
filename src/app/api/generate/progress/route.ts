import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * SSE endpoint для получения прогресса генерации
 * Используется для real-time обновлений прогресс-бара
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('generationId');

    if (!generationId) {
      return new Response('Missing generationId', { status: 400 });
    }

    // Создаём SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Функция для отправки события
        const sendEvent = (data: {
          status: string;
          progress: number;
          message: string;
        }) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // Объявляем переменные для interval и timeout вне try блока
        let timeout: NodeJS.Timeout | null = null;
        let interval: NodeJS.Timeout | null = null;

        try {
          // Симуляция прогресса (в реальности здесь будет подключение к Replicate API)
          // Для DALL-E 3 прогресс недоступен, поэтому отправляем только статус
          let progress = 0;
          
          // Отправляем начальный статус
          sendEvent({ status: 'generating', progress: 0, message: 'Инициализация...' });

          // Симулируем прогресс (в реальности это будет из Replicate webhook)
          interval = setInterval(() => {
            progress += 10;
            
            if (progress < 100) {
              sendEvent({
                status: 'generating',
                progress,
                message: `Генерация... ${progress}%`,
              });
            } else {
              if (interval) {
                clearInterval(interval);
                interval = null;
              }
              // Очищаем таймаут при успешном завершении
              if (timeout) {
                clearTimeout(timeout);
                timeout = null;
              }
              sendEvent({
                status: 'completed',
                progress: 100,
                message: 'Готово!',
              });
              controller.close();
            }
          }, 500);

          // Таймаут на случай, если генерация зависнет
          // Установлен 8 секунд для совместимости с Vercel Free планом (лимит 10 сек)
          timeout = setTimeout(() => {
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
            timeout = null;
            sendEvent({
              status: 'error',
              progress: 0,
              message: 'Таймаут генерации',
            });
            controller.close();
          }, 8000); // 8 секунд (с запасом для Free плана Vercel)

        } catch {
          // Очищаем interval и timeout при ошибке
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          sendEvent({
            status: 'error',
            progress: 0,
            message: 'Ошибка генерации',
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('SSE error:', error);
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}

