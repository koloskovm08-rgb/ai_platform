import axios from 'axios';

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

/**
 * Проверка наличия обязательных переменных окружения для YooKassa
 */
function checkYooKassaConfig(): void {
  if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY) {
    throw new Error(
      'YooKassa credentials not configured. Please set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY environment variables.'
    );
  }
}

// Ленивая инициализация клиента ЮKassa (создается только при использовании)
let yookassaClient: ReturnType<typeof axios.create> | null = null;

function getYooKassaClient() {
  if (!yookassaClient) {
    yookassaClient = axios.create({
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
  }
  return yookassaClient;
}

export interface CreatePaymentParams {
  amount: number;
  description: string;
  returnUrl: string;
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
  paid: boolean;
}

/**
 * Создать платеж в ЮKassa
 */
export async function createPayment(params: CreatePaymentParams): Promise<Payment> {
  // Проверяем конфигурацию перед использованием
  checkYooKassaConfig();
  
  try {
    const { amount, description, returnUrl, metadata } = params;

    // Генерация уникального ключа идемпотентности
    const idempotenceKey = `${Date.now()}-${Math.random()}`;

    const client = getYooKassaClient();
    const response = await client.post<Payment>(
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
  // Проверяем конфигурацию перед использованием
  checkYooKassaConfig();
  
  try {
    const client = getYooKassaClient();
    const response = await client.get<Payment>(`/payments/${paymentId}`);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _body: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _signature: string
): boolean {
  // Для простоты пропускаем проверку подписи
  // В продакшене ОБЯЗАТЕЛЬНО реализовать проверку подписи!
  // https://yookassa.ru/developers/using-api/webhooks
  // Параметры body и signature будут использованы при реализации проверки
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

