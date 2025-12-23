# 🔒 Безопасность AI Image Platform

## Обзор безопасности

Этот документ описывает меры безопасности, реализованные в AI Image Platform.

---

## 🛡️ Реализованные меры

### 1. Аутентификация и авторизация

#### NextAuth.js v5
- ✅ Безопасное хранение сессий
- ✅ JWT токены с подписью
- ✅ HttpOnly cookies
- ✅ CSRF защита встроена

#### Проверка прав доступа
```typescript
// Все защищенные API routes проверяют auth
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Админские routes дополнительно проверяют роль
if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

#### Middleware защита
- ✅ Автоматический редирект неавторизованных пользователей
- ✅ Защита админских маршрутов
- ✅ Защита API endpoints

---

### 2. Валидация данных

#### Zod схемы
Все входящие данные валидируются:

```typescript
// Пример из API generate
const generateImageSchema = z.object({
  prompt: z.string().min(1).max(2000),
  model: z.enum(['STABLE_DIFFUSION', 'DALL_E_3', 'MIDJOURNEY']),
  width: z.number().min(256).max(2048),
  height: z.number().min(256).max(2048),
  // ...
});
```

#### Защита от инъекций
- ✅ Prisma ORM (параметризованные запросы)
- ✅ Zod валидация
- ✅ TypeScript типизация

---

### 3. Security Headers

#### Next.js конфигурация
```typescript
// next.config.ts
headers: [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN', // Защита от clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff', // Защита от MIME sniffing
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block', // XSS защита (legacy)
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload', // HTTPS only
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()', // Отключаем ненужные API
  },
]
```

#### Vercel автоматически добавляет:
- SSL/TLS сертификаты
- DDoS защиту
- Edge caching

---

### 4. Защита API

#### Rate Limiting
Базовая реализация в `auth-helpers.ts`:
```typescript
checkRateLimit(identifier, limit, windowMs)
```

**Рекомендация для production:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

#### API Key защита (для developer API)
```typescript
// src/app/api/developer/keys/route.ts
const apiKey = request.headers.get('x-api-key');
const validKey = await prisma.apiKey.findUnique({
  where: { key: apiKey, isActive: true }
});
```

---

### 5. База данных

#### Prisma безопасность
- ✅ Параметризованные запросы (защита от SQL injection)
- ✅ Row Level Security через Prisma filters
- ✅ Cascade deletion для связанных данных

#### Connection pooling
```typescript
// src/lib/db/prisma.ts
// Один глобальный экземпляр PrismaClient
// Предотвращает исчерпание connection pool
```

#### Чувствительные данные
- ✅ Пароли хешируются через bcryptjs (10 rounds)
- ✅ API ключи хешируются перед сохранением
- ✅ Никакие пароли не логируются

---

### 6. Файлы и загрузки

#### Ограничения размера
```typescript
// next.config.ts
experimental: {
  serverActions: {
    bodySizeLimit: '10mb' // Максимальный размер
  }
}
```

#### Валидация типов файлов
```typescript
// В API routes
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  return error('Invalid file type');
}
```

#### Cloudinary безопасность
- ✅ Signed uploads
- ✅ Автоматическая оптимизация
- ✅ CDN delivery

---

### 7. Секреты и переменные окружения

#### Не коммитим в Git
```gitignore
.env
.env.local
.env.production
```

#### Используем Vercel Environment Variables
- Разные секреты для dev/production
- Encrypted at rest
- Access control

#### Ротация секретов
Регулярно обновляйте:
- `NEXTAUTH_SECRET`
- API ключи (Replicate, OpenAI)
- Database passwords

---

### 8. Платежи (ЮKassa)

#### Webhook защита
```typescript
// src/app/api/subscription/webhook/route.ts
const signature = request.headers.get('x-yookassa-signature');
const isValid = verifyWebhookSignature(body, signature);

if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

#### Idempotency
- ✅ Проверка дублирующихся платежей по `paymentId`
- ✅ Атомарные транзакции в БД

---

### 9. Frontend безопасность

#### XSS защита
- ✅ React автоматически экранирует данные
- ✅ `dangerouslySetInnerHTML` не используется
- ✅ Sanitization пользовательского контента

#### CSRF защита
- ✅ NextAuth встроенная защита
- ✅ SameSite cookies
- ✅ Origin checking

#### Content Security Policy
```typescript
// Для SVG изображений в next.config.ts
contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
```

---

## ⚠️ Известные ограничения

### 1. Rate Limiting
**Текущее состояние:** Базовая in-memory реализация  
**Рекомендация:** Использовать Redis (Upstash) для distributed rate limiting

### 2. Email verification
**Текущее состояние:** Опциональная верификация  
**Рекомендация:** Сделать обязательной для критичных операций

### 3. 2FA
**Текущее состояние:** Не реализовано  
**Рекомендация:** Добавить для админов и платных аккаунтов

### 4. Content moderation
**Текущее состояние:** Нет модерации AI-генерированного контента  
**Рекомендация:** Интегрировать Replicate Safety Checker или Perspective API

---

## 🚨 Reporting vulnerabilities

Если вы нашли уязвимость безопасности:

1. **НЕ создавайте публичный Issue**
2. Отправьте email: security@yourdomain.com
3. Опишите уязвимость и шаги для воспроизведения
4. Мы ответим в течение 48 часов

---

## 📋 Security Checklist для деплоя

Перед деплоем в production:

- [ ] Новый `NEXTAUTH_SECRET` сгенерирован
- [ ] Все API ключи валидны и не из dev окружения
- [ ] `DATABASE_URL` использует SSL (`?sslmode=require`)
- [ ] Google OAuth redirect URIs обновлены
- [ ] ЮKassa webhook URL настроен
- [ ] Security headers активны (проверить через securityheaders.com)
- [ ] Rate limiting настроен для критичных endpoints
- [ ] Error messages не раскрывают внутреннюю информацию
- [ ] Логирование не содержит чувствительных данных
- [ ] Backup БД настроен

---

## 🔄 Регулярное обслуживание

### Еженедельно
- Проверять логи на подозрительную активность
- Мониторить rate limit violations

### Ежемесячно
- Обновлять зависимости: `npm audit fix`
- Проверять истекшие API ключи
- Ревью access logs

### Ежеквартально
- Ротация `NEXTAUTH_SECRET`
- Security audit кода
- Тестирование disaster recovery

---

## 📚 Дополнительные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Vercel Security](https://vercel.com/docs/security)
- [Prisma Security](https://www.prisma.io/docs/guides/database/advanced-database-tasks/sql-injection)

---

**Последнее обновление:** 2025-12-24  
**Версия:** 1.0.0

