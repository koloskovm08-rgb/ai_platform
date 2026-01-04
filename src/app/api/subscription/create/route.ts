import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPayment, getPaymentDescription, getPlanPrice } from '@/lib/payment/yookassa';
import { z } from 'zod';
import { getServerBaseUrl } from '@/lib/base-url';

const createSubscriptionSchema = z.object({
  plan: z.enum(['PRO', 'PREMIUM']),
});

/**
 * POST: Создать подписку (инициировать платеж)
 */
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
    const validatedData = createSubscriptionSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Некорректные данные',
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { plan } = validatedData.data;
    const amount = getPlanPrice(plan);
    const description = getPaymentDescription(plan);

    // Создать платеж в ЮKassa
    const baseUrl = getServerBaseUrl();
    const payment = await createPayment({
      amount,
      description,
      returnUrl: `${baseUrl}/subscription?success=true`,
      metadata: {
        userId: session.user.id,
        plan,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
      amount: payment.amount.value,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Ошибка создания подписки' },
      { status: 500 }
    );
  }
}

