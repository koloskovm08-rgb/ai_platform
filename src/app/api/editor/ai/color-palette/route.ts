import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { suggestColorPalette } from '@/lib/ai/editor-assistant';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { context } = body;

    const palettes = await suggestColorPalette(context || {});

    return NextResponse.json({ palettes });
  } catch (error) {
    console.error('Color palette error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения палитры' },
      { status: 500 }
    );
  }
}

