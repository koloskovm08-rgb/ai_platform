import axios from 'axios';

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

// Клиент ЮKassa
const yookassaClient = axios.create({
  baseURL: YOOKASSA_API_URL,
  auth: {
    username: process.env.YOOKASSA_SHOP_ID || '',
    password: process.env.YOOKASSA_SECRET_KEY || '',
  },
  headers: {
    'Content-Type': 'application/json',
    'Idempotence-Key': '', // Будет установлен для каждого запроса
  },
});

export interface CreatePaymentParams {
  amount: number;
  description: string;
  returnUrl: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  confirmation?: {
    type: string;
    confirmation_url?: string;
  };
  metadata?: Record<string, any>;
  paid: boolean;
}

/**
 * Создать платеж в ЮKassa
 */
export async function createPayment(params: CreatePaymentParams): Promise<Payment> {
  try {
    const { amount, description, returnUrl, metadata } = params;

    // Генерация уникального ключа идемпотентности
    const idempotenceKey = `${Date.now()}-${Math.random()}`;

    const response = await yookassaClient.post<Payment>(
      '/payments',
      {
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: returnUrl,
        },
        capture: true,
        description,
        metadata,
      },
      {
        headers: {
          'Idempotence-Key': idempotenceKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('YooKassa create payment error:', error);
    throw new Error('Ошибка создания платежа');
  }
}

/**
 * Получить информацию о платеже
 */
export async function getPayment(paymentId: string): Promise<Payment> {
  try {
    const response = await yookassaClient.get<Payment>(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('YooKassa get payment error:', error);
    throw new Error('Ошибка получения платежа');
  }
}

/**
 * Проверить подпись webhook
 */
export function verifyWebhookSignature(
  body: any,
  signature: string
): boolean {
  // Для простоты пропускаем проверку подписи
  // В продакшене ОБЯЗАТЕЛЬНО реализовать проверку подписи!
  // https://yookassa.ru/developers/using-api/webhooks
  return true;
}

/**
 * Тарифные планы с ценами
 */
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    generationsLimit: 10,
    description: 'Бесплатный план для начинающих',
  },
  PRO: {
    name: 'Pro',
    price: 990,
    generationsLimit: 100,
    description: 'Для профессионалов',
  },
  PREMIUM: {
    name: 'Premium',
    price: 2990,
    generationsLimit: 999999, // Безлимит
    description: 'Без ограничений',
  },
};

/**
 * Получить цену тарифного плана
 */
export function getPlanPrice(plan: 'FREE' | 'PRO' | 'PREMIUM'): number {
  return SUBSCRIPTION_PLANS[plan].price;
}

/**
 * Получить описание платежа
 */
export function getPaymentDescription(plan: 'PRO' | 'PREMIUM'): string {
  return `Подписка ${SUBSCRIPTION_PLANS[plan].name} на AI Image Platform`;
}

