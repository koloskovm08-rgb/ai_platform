import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await registerUser(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, errors: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: result.message },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

