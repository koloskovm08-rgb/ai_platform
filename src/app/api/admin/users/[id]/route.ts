import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  subscriptionPlan: z.enum(['FREE', 'PRO', 'PREMIUM']).optional(),
});

/**
 * PATCH: Обновить пользователя
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Некорректные данные',
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { role, subscriptionPlan } = validatedData.data;

    // Обновление роли
    if (role) {
      await prisma.user.update({
        where: { id: params.id },
        data: { role },
      });
    }

    // Обновление подписки
    if (subscriptionPlan) {
      await prisma.subscription.update({
        where: { userId: params.id },
        data: { plan: subscriptionPlan },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Пользователь обновлен',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления пользователя' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Удалить пользователя
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Нельзя удалить самого себя
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Нельзя удалить самого себя' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Пользователь удален',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления пользователя' },
      { status: 500 }
    );
  }
}

