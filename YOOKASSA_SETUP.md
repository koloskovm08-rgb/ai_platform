# Настройка ЮKassa для приема платежей

## Шаг 1: Регистрация в ЮKassa

1. Перейдите на https://yookassa.ru
2. Нажмите "Подключиться"
3. Заполните данные вашей компании или ИП
4. Дождитесь модерации (1-3 дня)

## Шаг 2: Получение API ключей

1. Войдите в личный кабинет ЮKassa
2. Перейдите в раздел "Настройки" → "Интеграция"
3. Создайте новый API-ключ
4. Скопируйте:
   - **shopId** (идентификатор магазина)
   - **secretKey** (секретный ключ)

⚠️ **Важно:** Никогда не публикуйте secretKey в открытом доступе!

## Шаг 3: Добавление ключей в проект

Добавьте в файл `.env.local`:

```env
YOOKASSA_SHOP_ID="ваш_shop_id"
YOOKASSA_SECRET_KEY="ваш_secret_key"
```

## Шаг 4: Настройка Webhook

1. В личном кабинете ЮKassa перейдите "Настройки" → "HTTP-уведомления"
2. Добавьте URL webhook:
   ```
   https://ваш-домен.ru/api/subscription/webhook
   ```
3. Выберите события:
   - ✅ payment.succeeded (успешная оплата)
   - ✅ payment.canceled (отмена платежа)
4. Сохраните

⚠️ **Для локальной разработки** используйте ngrok:

```bash
ngrok http 3000
```

Затем используйте ngrok URL для webhook:
```
https://abc123.ngrok.io/api/subscription/webhook
```

## Шаг 5: Тестовый режим

ЮKassa предоставляет тестовый режим для отладки:

1. В личном кабинете включите "Тестовый режим"
2. Используйте тестовые карты для проверки:

**Успешная оплата:**
- Номер: 5555 5555 5555 4477
- Срок: 12/24
- CVV: 123

**Отклонение платежа:**
- Номер: 4111 1111 1111 1026
- Срок: 12/24
- CVV: 123

## Шаг 6: Проверка работы

1. Запустите проект:
   ```bash
   npm run dev
   ```

2. Перейдите на http://localhost:3000/subscription

3. Выберите план Pro или Premium

4. Нажмите "Выбрать план"

5. Вы будете перенаправлены на страницу оплаты ЮKassa

6. Используйте тестовую карту для оплаты

7. После успешной оплаты:
   - Webhook вызовется автоматически
   - Подписка обновится в БД
   - Пользователь перенаправится на /subscription?success=true

## Безопасность (Production)

В продакшене ОБЯЗАТЕЛЬНО реализуйте:

### 1. Проверка подписи webhook

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(body: any, signature: string): boolean {
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return hash === signature;
}
```

### 2. Rate limiting

Добавьте ограничение на количество запросов к API подписок:

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 3. HTTPS

Убедитесь, что ваш сайт использует HTTPS (обязательно для webhook).

### 4. Логирование

Логируйте все платежи и webhook события:

```typescript
await prisma.paymentLog.create({
  data: {
    paymentId: payment.id,
    status: payment.status,
    amount: payment.amount,
    metadata: payment.metadata,
  },
});
```

## Отладка проблем

### Webhook не вызывается

1. Проверьте URL webhook в настройках ЮKassa
2. Убедитесь, что сервер доступен извне (используйте ngrok для локальной разработки)
3. Проверьте логи ЮKassa в личном кабинете

### Платеж не проходит

1. Проверьте корректность API ключей
2. Убедитесь, что в тестовом режиме используются тестовые карты
3. Проверьте лимиты и ограничения вашего аккаунта

### Подписка не обновляется

1. Проверьте, что webhook правильно обрабатывает событие
2. Проверьте наличие userId и plan в metadata платежа
3. Проверьте логи сервера на ошибки

## Полезные ссылки

- Документация ЮKassa API: https://yookassa.ru/developers/api
- Тестовые данные: https://yookassa.ru/developers/payment-acceptance/testing-and-going-live/testing
- Webhook: https://yookassa.ru/developers/using-api/webhooks
- Поддержка: support@yookassa.ru

