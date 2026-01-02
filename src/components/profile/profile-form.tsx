'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, User, Mail, Lock, AlertCircle, CheckCircle2, Upload, X, Camera } from 'lucide-react';
import { useSession } from 'next-auth/react';

// Схема валидации для формы профиля
const profileSchema = z.object({
  name: z.string().min(2, 'Имя должно быть минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Если указан новый пароль, то нужен текущий
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Необходимо указать текущий пароль',
  path: ['currentPassword'],
}).refine((data) => {
  // Новый пароль должен быть минимум 6 символов
  if (data.newPassword && data.newPassword.length < 6) {
    return false;
  }
  return true;
}, {
  message: 'Пароль должен быть минимум 6 символов',
  path: ['newPassword'],
}).refine((data) => {
  // Пароли должны совпадать
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
  };
}

/**
 * Форма редактирования профиля
 * Позволяет изменить имя, email, пароль
 */
export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user.image);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Обработка загрузки аватарки
  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploadingAvatar(true);
      setError(null);

      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');
      
      // Загружаем через серверный API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Не удалось загрузить изображение';
        throw new Error(errorMessage);
      }

      if (!result.success || !result.url) {
        throw new Error('Не удалось получить URL загруженного изображения');
      }

      // Обновляем превью
      setAvatarPreview(result.url);
    } catch (err: unknown) {
      // Сохраняем сообщение об ошибке, сохраняя переносы строк
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки изображения';
      setError(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Обработка выбора файла
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер изображения не должен превышать 5MB');
      return;
    }

    handleAvatarUpload(file);
  };

  // Удаление аватарки
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Подготовка данных для отправки
      const updateData: {
        name: string;
        email: string;
        image?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        name: data.name,
        email: data.email,
      };

      // Добавляем аватарку, если она изменилась
      if (avatarPreview !== user.image && avatarPreview !== null) {
        updateData.image = avatarPreview;
      }

      // Добавляем пароли только если они указаны
      if (data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось обновить профиль');
      }

      // Обновляем сессию если изменилось имя или изображение
      const sessionUpdates: {
        name?: string;
        image?: string;
      } = {};
      if (data.name !== user.name) {
        sessionUpdates.name = data.name;
      }
      if (avatarPreview !== user.image && avatarPreview !== null) {
        sessionUpdates.image = avatarPreview;
      }
      if (Object.keys(sessionUpdates).length > 0) {
        await update(sessionUpdates);
      }

      setSuccess(true);
      
      // Очищаем поля пароля
      reset({
        name: data.name,
        email: data.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Обновляем страницу через 2 секунды
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Информация об email верификации */}
        {!user.emailVerified && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                Email не подтверждён
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Проверьте вашу почту для подтверждения email адреса
              </p>
            </div>
          </div>
        )}

        {/* Аватарка */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Фото профиля
          </Label>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                src={avatarPreview}
                name={user.name}
                size="xl"
                alt="Аватарка"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isUploadingAvatar}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {avatarPreview ? 'Изменить фото' : 'Загрузить фото'}
                </Button>
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isLoading || isUploadingAvatar}
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    Удалить
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Рекомендуемый размер: 400x400px. Максимальный размер: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Имя */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Имя
          </Label>
          <Input
            id="name"
            placeholder="Ваше имя"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            При смене email потребуется повторная верификация
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Изменить пароль (опционально)
          </h3>

          <div className="space-y-4">
            {/* Текущий пароль */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Текущий пароль</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                {...register('currentPassword')}
                disabled={isLoading}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* Новый пароль */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                {...register('newPassword')}
                disabled={isLoading}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Сообщения об ошибках и успехе */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-600 dark:text-red-500 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600 dark:text-green-500">
              Профиль успешно обновлён!
            </p>
          </div>
        )}

        {/* Кнопка сохранения */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            'Сохранить изменения'
          )}
        </Button>
      </form>
    </Card>
  );
}

