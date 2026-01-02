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

// Схема валидации для входа
const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

// Проверка обязательных переменных окружения
function validateAuthConfig() {
  const requiredVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
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
        if (v === 'NEXTAUTH_SECRET') {
          return `  ${v}="сгенерируйте через: openssl rand -base64 32"`;
        }
        if (v === 'NEXTAUTH_URL') {
          return `  ${v}="http://localhost:3000"`;
        }
        return `  ${v}="ваше-значение"`;
      }).join('\n');
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Проверка формата NEXTAUTH_URL
  if (requiredVars.NEXTAUTH_URL && !requiredVars.NEXTAUTH_URL.startsWith('http')) {
    throw new Error(
      `❌ NEXTAUTH_URL must start with http:// or https://\n` +
      `Current value: ${requiredVars.NEXTAUTH_URL}\n` +
      `For local development use: http://localhost:3000`
    );
  }

  // Проверка длины NEXTAUTH_SECRET
  if (requiredVars.NEXTAUTH_SECRET && requiredVars.NEXTAUTH_SECRET.length < 32) {
    console.warn(
      `⚠️ NEXTAUTH_SECRET should be at least 32 characters long.\n` +
      `Current length: ${requiredVars.NEXTAUTH_SECRET.length}\n` +
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
        // Упрощенная конфигурация для NextAuth v5
        // Параметры authorization не нужны, NextAuth v5 обрабатывает это автоматически
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
      } catch (error) {
        console.error('❌ LinkAccount event error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  },
};

