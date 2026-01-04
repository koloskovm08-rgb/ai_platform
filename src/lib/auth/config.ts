import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma, safePrismaQuery } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import { UserRole } from '@prisma/client';
import type { Provider } from 'next-auth/providers';
import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers';

// Схема валидации для входа
const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

// Типы для VK OAuth
interface VKProfile {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  photo_200?: string;
}

interface VKTokenResponse {
  access_token: string;
  expires_in: number;
  user_id: number;
  email?: string;
}

type VKTokenRequestContext = {
  params: { redirect_uri?: string; code?: string } & Record<string, string | undefined>;
  provider: { token?: { url?: string } };
};

type VKUserinfoRequestContext = {
  tokens: { access_token?: string } & Record<string, unknown>;
  provider: { userinfo?: { url?: string } };
};

// Кастомный VK OAuth провайдер
function VKProvider(options: OAuthUserConfig<VKProfile>): OAuthConfig<VKProfile> {
  // В типах NextAuth `checks` для OAuth2 не включает "nonce",
  // но `OAuthUserConfig` может его допускать. Чтобы не ломать сборку,
  // исключаем `checks` из spread-опций и используем нашу конфигурацию.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { checks: _checks, ...restOptions } = options;
  return {
    id: 'vk',
    name: 'VK',
    type: 'oauth',
    authorization: {
      url: 'https://oauth.vk.com/authorize',
      params: {
        // Для публикаций в группу нужны права на wall/photos (+ часто groups/offline)
        // Важно: после изменения scope нужно перелогиниться через VK, чтобы токен обновился.
        scope: 'email,wall,photos,groups,offline',
        response_type: 'code',
        display: 'page',
        v: '5.131', // Версия VK API
      },
    },
    token: {
      url: 'https://oauth.vk.com/access_token',
      async request({ params, provider }: VKTokenRequestContext) {
        if (!options.clientId || !options.clientSecret) {
          throw new Error('VK OAuth: clientId and clientSecret are required');
        }
        const url = new URL(provider.token?.url as string);
        url.searchParams.append('client_id', options.clientId);
        url.searchParams.append('client_secret', options.clientSecret);
        url.searchParams.append('redirect_uri', params.redirect_uri || '');
        url.searchParams.append('code', params.code as string);

        const response = await fetch(url.toString());
        const tokens: VKTokenResponse = await response.json();

        if (!response.ok) {
          throw new Error('Failed to fetch VK access token');
        }

        return { tokens };
      },
    },
    userinfo: {
      url: 'https://api.vk.com/method/users.get',
      async request({ tokens, provider }: VKUserinfoRequestContext) {
        const url = new URL(provider.userinfo?.url as string);
        url.searchParams.append('access_token', tokens.access_token as string);
        url.searchParams.append('fields', 'photo_200');
        url.searchParams.append('v', '5.131');

        const response = await fetch(url.toString());
        const data = await response.json();

        if (!data.response || !data.response[0]) {
          throw new Error('Failed to fetch VK user info');
        }

        const profile = data.response[0];
        
        // VK может вернуть email в токене, а не в профиле
        const vkTokens = tokens as unknown as VKTokenResponse;
        if (vkTokens.email) {
          profile.email = vkTokens.email;
        }

        return profile;
      },
    },
    profile(profile) {
      return {
        id: String(profile.id),
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email || `vk${profile.id}@vk.placeholder.com`, // Фолбэк если нет email
        image: profile.photo_200 ?? null,
        role: UserRole.USER,
      };
    },
    style: {
      logo: '/vk-logo.svg',
      bg: '#0077FF',
      text: '#fff',
    },
    ...restOptions,
  };
}

// Проверка обязательных переменных окружения
function validateAuthConfig() {
  /**
   * NextAuth v5 (Auth.js) чаще использует AUTH_SECRET, а старые гайды — NEXTAUTH_SECRET.
   * Поддерживаем оба варианта.
   */
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  /**
   * Базовый URL важен для email-ссылок/redirect-URI, но на Vercel его часто не задают явно:
   * можно безопасно брать из NEXT_PUBLIC_SITE_URL или VERCEL_URL.
   *
   * IMPORTANT: VERCEL_URL приходит без протокола (например: myapp.vercel.app).
   */
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  const requiredVars = {
    'NEXTAUTH_URL или NEXT_PUBLIC_SITE_URL или VERCEL_URL': baseUrl,
    'AUTH_SECRET или NEXTAUTH_SECRET': authSecret,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  const missing: string[] = [];
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `❌ NextAuth Configuration Error: Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please add these variables to your .env.local file:\n` +
      missing.map(v => {
        if (v === 'AUTH_SECRET или NEXTAUTH_SECRET') {
          return `  AUTH_SECRET="сгенерируйте через: openssl rand -base64 32"`;
        }
        if (v === 'NEXTAUTH_URL или NEXT_PUBLIC_SITE_URL или VERCEL_URL') {
          return `  NEXTAUTH_URL="http://localhost:3000"`;
        }
        return `  ${v}="ваше-значение"`;
      }).join('\n');
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Проверка формата базового URL
  if (baseUrl && !baseUrl.startsWith('http')) {
    throw new Error(
      `❌ Base URL must start with http:// or https://\n` +
      `Current value: ${baseUrl}\n` +
      `For local development use: http://localhost:3000`
    );
  }

  // Проверка длины AUTH_SECRET/NEXTAUTH_SECRET
  if (authSecret && authSecret.length < 32) {
    console.warn(
      `⚠️ AUTH_SECRET/NEXTAUTH_SECRET should be at least 32 characters long.\n` +
      `Current length: ${authSecret.length}\n` +
      `Generate a new one: openssl rand -base64 32`
    );
  }
}

// Выполняем проверку при загрузке модуля
// Не выбрасываем ошибку во время сборки (build time), так как переменные окружения
// могут быть недоступны. Проверка будет выполнена при первом использовании в runtime.
try {
  validateAuthConfig();
} catch (error) {
  // Во время сборки только предупреждаем, не останавливаем процесс
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn('⚠️ Auth config validation warning during build:', error instanceof Error ? error.message : error);
  } else if (process.env.NODE_ENV === 'production') {
    // В production runtime выбрасываем ошибку
    throw error;
  } else {
    console.error(error);
  }
}

// Создаем массив провайдеров с условным добавлением Google
const providers: Provider[] = [
  // Credentials провайдер (email/password) - всегда доступен
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      try {
        // Валидация входных данных
        const validatedFields = loginSchema.safeParse(credentials);
        
        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        // Поиск пользователя в БД
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        // Проверка пароля
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      } catch (error) {
        console.error('Authorization error:', error);
        return null;
      }
    },
  }),
];

// Добавляем Google OAuth провайдер только если есть credentials
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret && googleClientId.trim() !== '' && googleClientSecret.trim() !== '') {
  try {
    providers.push(
      GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        allowDangerousEmailAccountLinking: true,
      })
    );
    const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log('✅ Google OAuth provider configured');
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Google OAuth callback URL:', `${nextAuthUrl}/api/auth/callback/google`);
      console.log('💡 Убедитесь, что этот URL добавлен в Google Console → Credentials → Authorized redirect URIs');
      console.log('📋 Google Client ID:', googleClientId.substring(0, 20) + '...');
    }
  } catch (error) {
    console.error('❌ Error configuring Google OAuth provider:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    });
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ Google OAuth provider is not configured.\n' +
      'To enable Google login, add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local file.\n' +
      'Get credentials from: https://console.cloud.google.com/apis/credentials'
    );
  }
}

// Добавляем VK OAuth провайдер только если есть credentials
const vkClientId = process.env.VK_CLIENT_ID;
const vkClientSecret = process.env.VK_CLIENT_SECRET;

if (vkClientId && vkClientSecret && vkClientId.trim() !== '' && vkClientSecret.trim() !== '') {
  try {
    providers.push(
      VKProvider({
        clientId: vkClientId,
        clientSecret: vkClientSecret,
      })
    );
    const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log('✅ VK OAuth provider configured');
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 VK OAuth callback URL:', `${nextAuthUrl}/api/auth/callback/vk`);
      console.log('💡 Убедитесь, что этот URL добавлен в настройках приложения VK → Доверенный redirect URI');
      console.log('📋 VK Client ID:', vkClientId);
    }
  } catch (error) {
    console.error('❌ Error configuring VK OAuth provider:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    });
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ VK OAuth provider is not configured.\n' +
      'To enable VK login, add VK_CLIENT_ID and VK_CLIENT_SECRET to your .env.local file.\n' +
      'Get credentials from: https://dev.vk.com/ → Создать приложение'
    );
  }
}

// Создаем PrismaAdapter с обработкой ошибок
let adapter: ReturnType<typeof PrismaAdapter> | undefined;
try {
  adapter = PrismaAdapter(prisma);
  console.log('✅ PrismaAdapter initialized');
} catch (error) {
  console.error('❌ Error initializing PrismaAdapter:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    errorName: error instanceof Error ? error.name : undefined,
  });
  // В development режиме выбрасываем ошибку, чтобы сразу увидеть проблему
  if (process.env.NODE_ENV === 'development') {
    throw error;
  }
}

export const authConfig: NextAuthConfig = {
  // @ts-expect-error - Type mismatch between @auth/prisma-adapter and next-auth's internal @auth/core versions
  adapter: adapter,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development', // Включаем debug в development
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      try {
        // При первом входе добавляем данные пользователя в токен
        if (user && 'id' in user && 'role' in user) {
          token.id = user.id as string;
          token.role = user.role as UserRole;
          token.name = user.name as string | null;
          token.email = user.email as string;
          token.image = user.image as string | null;
          
          if (account?.provider === 'google') {
            console.log('🔐 JWT: Google OAuth user data added to token:', {
              userId: user.id,
              email: user.email,
            });
          }
          
          if (account?.provider === 'vk') {
            console.log('🔐 JWT: VK OAuth user data added to token:', {
              userId: user.id,
              email: user.email,
            });
          }
        }
        
        // При обновлении сессии
        if (trigger === 'update' && session) {
          token.name = session.name;
          token.image = session.image;
        }
        
        return token;
      } catch (error) {
        console.error('❌ JWT callback error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorName: error instanceof Error ? error.name : undefined,
          hasToken: !!token,
          hasUser: !!user,
        });
        // Возвращаем токен даже при ошибке, чтобы не блокировать сессию
        return token;
      }
    },
    async session({ session, token }: {
      session: Session;
      token: JWT;
    }) {
      try {
        // Добавляем данные из токена в сессию
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as UserRole;
          session.user.name = token.name as string;
          session.user.email = token.email as string;
          session.user.image = token.image as string | null | undefined;
        }
        
        return session;
      } catch (error) {
        console.error('❌ Session callback error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorName: error instanceof Error ? error.name : undefined,
          hasToken: !!token,
          hasSession: !!session,
        });
        // Возвращаем сессию даже при ошибке, чтобы не блокировать пользователя
        return session;
      }
    },
    async signIn({ user, account, profile }) {
      try {
        // Логируем информацию о входе для диагностики
        if (account?.provider === 'google') {
          console.log('🔐 Google OAuth sign in callback:', {
            userId: user?.id,
            email: user?.email,
            name: user?.name,
            accountId: account?.providerAccountId,
            accountType: account?.type,
            hasProfile: !!profile,
            profileEmail: profile && typeof profile === 'object' && 'email' in profile ? profile.email : undefined,
          });
          
          // Проверяем, что адаптер работает
          if (!adapter) {
            console.warn('⚠️ PrismaAdapter is not initialized - OAuth accounts may not be saved to database');
          }
        }
        
        if (account?.provider === 'vk') {
          console.log('🔐 VK OAuth sign in callback:', {
            userId: user?.id,
            email: user?.email,
            name: user?.name,
            accountId: account?.providerAccountId,
            accountType: account?.type,
            hasProfile: !!profile,
          });
          
          // Проверяем, что адаптер работает
          if (!adapter) {
            console.warn('⚠️ PrismaAdapter is not initialized - OAuth accounts may not be saved to database');
          }
        }
        
        return true;
      } catch (error) {
        console.error('❌ SignIn callback error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorName: error instanceof Error ? error.name : undefined,
          provider: account?.provider,
          stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        });
        // Разрешаем вход даже при ошибке логирования, чтобы не блокировать пользователя
        return true;
      }
    },
  },
  events: {
    async createUser({ user }) {
      try {
        // При создании нового пользователя создаем бесплатную подписку
        if (user && 'id' in user && typeof user.id === 'string' && user.id) {
          const userId: string = user.id; // Сохраняем в переменную с явной типизацией
          
          console.log('👤 Creating subscription for new user:', {
            userId,
            email: user.email,
          });
          
          // Используем safePrismaQuery для обработки проблем с подключением к БД
          await safePrismaQuery(async () => {
            // Проверяем, не существует ли уже подписка (на случай race condition)
            const existingSubscription = await prisma.subscription.findUnique({
              where: { userId },
            });

            if (!existingSubscription) {
              await prisma.subscription.create({
                data: {
                  userId: userId,
                  plan: 'FREE',
                  status: 'ACTIVE',
                  generationsLeft: 10,
                  generationsLimit: 10,
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
                },
              });
              console.log('✅ Subscription created for user:', userId);
            } else {
              console.log('ℹ️ Subscription already exists for user:', userId);
            }
          }, 3); // Увеличиваем количество попыток до 3
        } else {
          console.warn('⚠️ Cannot create subscription: invalid user ID', {
            user: user ? { id: user.id, email: user.email } : null,
          });
        }
      } catch (error) {
        // Логируем ошибку, но не прерываем процесс создания пользователя
        console.error('❌ Error creating subscription for user:', {
          userId: user?.id,
          email: user?.email,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorName: error instanceof Error ? error.name : undefined,
          errorCode: (error as { code?: string })?.code,
          stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        });
        // Не выбрасываем ошибку, чтобы не блокировать создание пользователя
        // Подписку можно создать позже через отдельный процесс
      }
    },
    async signIn({ user, account, isNewUser }) {
      try {
        if (account?.provider === 'google') {
          console.log('🔐 Google OAuth sign in event:', {
            userId: user?.id,
            email: user?.email,
            isNewUser,
            accountId: account?.providerAccountId,
          });
        }
        
        if (account?.provider === 'vk') {
          console.log('🔐 VK OAuth sign in event:', {
            userId: user?.id,
            email: user?.email,
            isNewUser,
            accountId: account?.providerAccountId,
          });
        }
      } catch (error) {
        console.error('❌ SignIn event error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorName: error instanceof Error ? error.name : undefined,
        });
        // Не выбрасываем ошибку, чтобы не блокировать вход
      }
    },
    async linkAccount({ user, account }) {
      try {
        if (account?.provider === 'google') {
          console.log('🔗 Google account linked:', {
            userId: user?.id,
            email: user?.email,
            accountId: account?.providerAccountId,
          });
        }
        
        if (account?.provider === 'vk') {
          console.log('🔗 VK account linked:', {
            userId: user?.id,
            email: user?.email,
            accountId: account?.providerAccountId,
          });
        }
      } catch (error) {
        console.error('❌ LinkAccount event error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  },
};

