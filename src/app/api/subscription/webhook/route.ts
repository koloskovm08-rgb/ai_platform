import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payment/yookassa';
import { updateSubscriptionPlan } from '@/lib/utils/subscription';

/**
 * POST: Webhook от ЮKassa
 * Вызывается после успешной оплаты
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-yookassa-signature') || '';

    // Проверка подписи (в продакшене ОБЯЗАТЕЛЬНО!)
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    const { event, object } = body;

    // Обрабатываем только успешные платежи
    if (event === 'payment.succeeded' && object.paid) {
      const { id: paymentId, metadata } = object;
      const { userId, plan } = metadata;

      if (!userId || !plan) {
        console.error('Missing metadata in payment', paymentId);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Обновить подписку пользователя
      await updateSubscriptionPlan(userId, plan, paymentId);

      console.log(`Subscription updated for user ${userId} to plan ${plan}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}

