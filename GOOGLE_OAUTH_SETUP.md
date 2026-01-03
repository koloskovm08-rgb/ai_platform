# Инструкция по настройке Google OAuth

## Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите на https://console.cloud.google.com/
2. Создайте новый проект или выберите существующий
3. Название проекта: `ArtiGen` (или любое другое)

## Шаг 2: Настройка OAuth consent screen

1. Перейдите в **APIs & Services** → **OAuth consent screen**
2. Выберите **External** (для публичного доступа)
3. Заполните обязательные поля:
   - **App name**: ArtiGen
   - **User support email**: ваш email
   - **Developer contact email**: ваш email
4. Нажмите **Save and Continue**
5. На странице **Scopes** нажмите **Save and Continue** (можно оставить по умолчанию)
6. На странице **Test users** нажмите **Save and Continue**
7. Проверьте информацию и нажмите **Back to Dashboard**

## Шаг 3: Создание OAuth 2.0 Client ID

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth client ID**
3. Выберите **Application type**: Web application
4. **Name**: ArtiGen Web Client
5. **Authorized redirect URIs** - добавьте:
   ```
   https://koloskovm08-rgb-aiplatform.vercel.app/api/auth/callback/google
   ```
   
   Для локальной разработки также добавьте:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

6. Нажмите **Create**
7. **Важно**: Скопируйте **Client ID** и **Client Secret** — они понадобятся на следующем шаге

## Шаг 4: Добавление переменных окружения в Vercel

1. Перейдите на https://vercel.com/
2. Выберите проект **koloskovm08-rgb-aiplatform**
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте две переменные:

### GOOGLE_CLIENT_ID
- **Name**: `GOOGLE_CLIENT_ID`
- **Value**: вставьте Client ID из Google Console
- **Environments**: выберите все (Production, Preview, Development)

### GOOGLE_CLIENT_SECRET
- **Name**: `GOOGLE_CLIENT_SECRET`
- **Value**: вставьте Client Secret из Google Console
- **Environments**: выберите все (Production, Preview, Development)

5. Нажмите **Save** для каждой переменной

## Шаг 5: Переразвертывание проекта

После добавления переменных окружения:

### Вариант 1: Через Vercel Dashboard
1. Перейдите на главную страницу проекта в Vercel
2. Найдите последний деплоймент
3. Нажмите **...** (три точки) → **Redeploy**
4. Выберите **Use existing Build Cache** (не обязательно)
5. Нажмите **Redeploy**

### Вариант 2: Через Git
1. Сделайте коммит с любым изменением (можно добавить пустую строку в README)
2. Запушьте в основную ветку
3. Vercel автоматически переразвернет проект

## Шаг 6: Проверка настройки

После переразвертывания проверьте:

1. Откройте https://koloskovm08-rgb-aiplatform.vercel.app/api/auth/providers
2. В ответе должен быть Google провайдер:
   ```json
   {
     "credentials": {...},
     "google": {
       "id": "google",
       "name": "Google",
       "type": "oauth",
       "signinUrl": "...",
       "callbackUrl": "..."
     }
   }
   ```

3. Проверьте страницу регистрации:
   - Кнопка "Зарегистрироваться через Google" должна быть видна
   - При нажатии должно открываться окно выбора Google аккаунта

## Локальная разработка (опционально)

Для локальной разработки:

1. Создайте файл `.env.local` в корне проекта:
```bash
GOOGLE_CLIENT_ID=ваш_client_id
GOOGLE_CLIENT_SECRET=ваш_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ваш_секретный_ключ
```

2. Для генерации NEXTAUTH_SECRET выполните:
```bash
openssl rand -base64 32
```

## Возможные проблемы и решения

### Ошибка: "redirect_uri_mismatch"
**Причина**: Неправильно настроен Authorized redirect URI

**Решение**:
1. Убедитесь, что в Google Console добавлен точный URL:
   `https://koloskovm08-rgb-aiplatform.vercel.app/api/auth/callback/google`
2. Проверьте отсутствие лишних пробелов
3. Проверьте, что используется `https://`, а не `http://`

### Ошибка: "Access blocked: Authorization Error"
**Причина**: Приложение не опубликовано или пользователь не добавлен в Test users

**Решение**:
1. В Google Cloud Console перейдите в OAuth consent screen
2. Нажмите **Publish App** для публикации
3. ИЛИ добавьте тестовых пользователей в разделе **Test users**

### Провайдер не появляется в списке
**Причина**: Переменные окружения не применились

**Решение**:
1. Проверьте, что переменные добавлены в Vercel
2. Переразверните проект
3. Проверьте логи деплоймента на наличие ошибок
4. Подождите 1-2 минуты после переразвертывания

### Кнопка Google по-прежнему не отображается
**Причина**: Кеш браузера или проверка провайдера не прошла

**Решение**:
1. Очистите кеш браузера (Ctrl+Shift+R или Cmd+Shift+R)
2. Откройте консоль браузера и проверьте наличие ошибок
3. Проверьте `/api/auth/providers` напрямую

## Дополнительная информация

### Безопасность
- Никогда не коммитьте `.env.local` файл в Git
- Храните Client Secret в безопасном месте
- Регулярно ротируйте секретные ключи

### Лимиты Google OAuth
- Google OAuth имеет лимиты на количество запросов
- Для production приложения рекомендуется опубликовать приложение (Publish App)
- Неопубликованные приложения могут иметь ограничения на количество пользователей

### Полезные ссылки
- Google Cloud Console: https://console.cloud.google.com/
- NextAuth.js документация: https://next-auth.js.org/
- Vercel документация: https://vercel.com/docs

---

## Контрольный список

- [ ] Создан проект в Google Cloud Console
- [ ] Настроен OAuth consent screen
- [ ] Создан OAuth 2.0 Client ID
- [ ] Добавлен Authorized redirect URI для production
- [ ] Скопированы Client ID и Client Secret
- [ ] Добавлены переменные в Vercel (GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET)
- [ ] Проект переразвернут в Vercel
- [ ] Проверено `/api/auth/providers` - Google провайдер присутствует
- [ ] Кнопка Google отображается на страницах регистрации и входа
- [ ] Проверен процесс регистрации через Google

