import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { suggestTextImprovements } from '@/lib/ai/editor-assistant';

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
    const { text, context } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Текст не указан' },
        { status: 400 }
      );
    }

    const suggestions = await suggestTextImprovements(text, context);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Text assist error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения предложений' },
      { status: 500 }
    );
  }
}

