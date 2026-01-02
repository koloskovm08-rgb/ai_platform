import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { suggestLayouts } from '@/lib/ai/editor-assistant';

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
    const { businessInfo } = body;

    const suggestions = await suggestLayouts(businessInfo || {});

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Layout suggestions error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения предложений' },
      { status: 500 }
    );
  }
}

