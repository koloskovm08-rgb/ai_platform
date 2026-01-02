import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserSubscription } from '@/lib/utils/subscription';

/**
 * GET: Получить текущую подписку пользователя
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Подписка не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения подписки' },
      { status: 500 }
    );
  }
}

