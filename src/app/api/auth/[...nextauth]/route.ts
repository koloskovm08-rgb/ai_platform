import { GET as baseGET, POST as basePOST } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Оборачиваем handlers для обработки ошибок и логирования
async function handleRequest(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Определяем провайдер из pathname (например, /api/auth/signin/google или /api/auth/callback/google)
    const isGoogleProvider = pathname.includes('/signin/google') || pathname.includes('/callback/google');
    
    // Проверяем, запрашивается ли Google провайдер
    if (isGoogleProvider) {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!googleClientId || !googleClientSecret || googleClientId.trim() === '' || googleClientSecret.trim() === '') {
        console.error('❌ Google OAuth provider requested but not configured:', {
          hasClientId: !!googleClientId,
          hasClientSecret: !!googleClientSecret,
          pathname,
        });
        
        // Возвращаем ошибку конфигурации
        return new Response(
          JSON.stringify({ 
            error: 'Configuration',
            message: 'Google OAuth provider is not configured. Please check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
          }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    // Логируем запросы для диагностики
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 NextAuth request:', {
        method: req.method,
        pathname,
        searchParams: Object.fromEntries(url.searchParams),
        isGoogleProvider,
      });
    }
    
    const response = await handler(req);
    
    // Логируем ответы для диагностики
    if (process.env.NODE_ENV === 'development' && !response.ok) {
      const responseText = await response.clone().text();
      console.error('❌ NextAuth error response:', {
        status: response.status,
        statusText: response.statusText,
        pathname,
        isGoogleProvider,
        body: responseText.substring(0, 500), // Первые 500 символов
      });
    }
    
    return response;
  } catch (error) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    console.error('❌ NextAuth route error:', {
      url: req.url,
      method: req.method,
      pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : undefined,
      errorCode: (error as { code?: string })?.code,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    });
    
    // Возвращаем ошибку в формате, понятном NextAuth
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'An error occurred during authentication'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(baseGET, req);
}

export async function POST(req: NextRequest) {
  return handleRequest(basePOST, req);
}

