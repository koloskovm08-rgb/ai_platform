import { NextResponse } from 'next/server';

function nonEmpty(value: string | undefined) {
  return Boolean(value && value.trim() !== '');
}

export async function GET() {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  const googleConfigured =
    nonEmpty(process.env.GOOGLE_CLIENT_ID) && nonEmpty(process.env.GOOGLE_CLIENT_SECRET);

  const vkConfigured = nonEmpty(process.env.VK_CLIENT_ID) && nonEmpty(process.env.VK_CLIENT_SECRET);

  return NextResponse.json({
    ok: true,
    nodeEnv: process.env.NODE_ENV ?? 'unknown',
    baseUrl: baseUrl ?? null,
    authSecretConfigured: nonEmpty(authSecret),
    oauth: {
      google: {
        configured: googleConfigured,
        callbackUrl: baseUrl ? `${baseUrl}/api/auth/callback/google` : null,
      },
      vk: {
        configured: vkConfigured,
        callbackUrl: baseUrl ? `${baseUrl}/api/auth/callback/vk` : null,
      },
    },
    tips: [
      'Если configured=false — проверь .env.local / Vercel Environment Variables',
      'Если callbackUrl не совпадает с Google Console → Authorized redirect URIs — будет redirect_uri_mismatch',
    ],
  });
}


