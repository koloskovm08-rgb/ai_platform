import { NextResponse } from 'next/server';

export async function GET() {
  // Проверяем переменные окружения напрямую
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      GOOGLE_CLIENT_ID: {
        exists: !!googleClientId,
        length: googleClientId?.length || 0,
        firstChars: googleClientId?.substring(0, 20) || null,
        lastChars: googleClientId?.substring(googleClientId.length - 20) || null,
        hasWhitespace: googleClientId ? /\s/.test(googleClientId) : false,
        trimmedLength: googleClientId?.trim().length || 0,
      },
      GOOGLE_CLIENT_SECRET: {
        exists: !!googleClientSecret,
        length: googleClientSecret?.length || 0,
        firstChars: googleClientSecret?.substring(0, 15) || null,
        hasWhitespace: googleClientSecret ? /\s/.test(googleClientSecret) : false,
        trimmedLength: googleClientSecret?.trim().length || 0,
      },
      NEXTAUTH_URL: {
        exists: !!nextAuthUrl,
        value: nextAuthUrl || null,
        length: nextAuthUrl?.length || 0,
        hasWhitespace: nextAuthUrl ? /\s/.test(nextAuthUrl) : false,
        trimmedLength: nextAuthUrl?.trim().length || 0,
      },
      AUTH_SECRET: {
        exists: !!authSecret,
        length: authSecret?.length || 0,
      },
    },
    checks: {
      googleConfigured: !!(googleClientId && googleClientSecret && 
                          googleClientId.trim() !== '' && 
                          googleClientSecret.trim() !== ''),
      allVariablesPresent: !!(googleClientId && googleClientSecret && nextAuthUrl && authSecret),
    },
  });
}

