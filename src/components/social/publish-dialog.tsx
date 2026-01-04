'use client';

import * as React from 'react';
import { Share2, Loader2, CalendarClock, Send, Link2Off } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toaster';
import { TELEGRAM_LIMITS, VK_LIMITS } from '@/lib/social/formatters';

type SocialPlatform = 'VK' | 'TELEGRAM';
type SocialContentType = 'GENERATION' | 'EDIT' | 'BUSINESS_CARD_PROJECT';

type SocialConnections = {
  vk: { connected: boolean; vkUserId?: string };
  telegram: Array<{ connected: boolean; chatId: string | null }>;
};

export interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  contentType: SocialContentType;
  contentId: string;
  imageUrl?: string;
  defaultCaption?: string;

  defaultPlatform?: SocialPlatform;
}

function toIsoFromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function PublishDialog({
  open,
  onOpenChange,
  contentType,
  contentId,
  imageUrl,
  defaultCaption,
  defaultPlatform = 'VK',
}: PublishDialogProps) {
  const toast = useToast();

  const VK_GROUP_ID_STORAGE_KEY = 'social.vk.groupId';
  const VK_FROM_GROUP_STORAGE_KEY = 'social.vk.fromGroup';

  const [platform, setPlatform] = React.useState<SocialPlatform>(defaultPlatform);
  const [caption, setCaption] = React.useState(defaultCaption ?? '');

  const [scheduleEnabled, setScheduleEnabled] = React.useState(false);
  const [scheduleFor, setScheduleFor] = React.useState('');

  // VK group settings
  const [vkGroupId, setVkGroupId] = React.useState('');
  const [vkFromGroup, setVkFromGroup] = React.useState(true);

  // Telegram connect/publish settings
  const [tgChatId, setTgChatId] = React.useState('');
  const [tgBotToken, setTgBotToken] = React.useState('');
  const [isConnectingTelegram, setIsConnectingTelegram] = React.useState(false);

  const [connections, setConnections] = React.useState<SocialConnections | null>(null);
  const [isLoadingConnections, setIsLoadingConnections] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const captionLimit = platform === 'VK' ? VK_LIMITS.captionMax : TELEGRAM_LIMITS.captionMax;

  const loadConnections = React.useCallback(async () => {
    setIsLoadingConnections(true);
    try {
      const res = await fetch('/api/social/connect', { method: 'GET' });
      const data = (await res.json()) as { success?: boolean; connections?: SocialConnections; error?: string };
      if (!res.ok || !data.connections) {
        throw new Error(data.error || 'Не удалось загрузить подключения');
      }
      setConnections(data.connections);
    } catch (e) {
      setConnections(null);
      toast.error(e instanceof Error ? e.message : 'Ошибка загрузки подключений');
    } finally {
      setIsLoadingConnections(false);
    }
  }, [toast]);

  // При открытии диалога подтягиваем статусы подключений
  React.useEffect(() => {
    if (!open) return;
    loadConnections();
  }, [open, loadConnections]);

  // Подставляем сохранённые VK настройки (если пользователь ещё не вводил в этом открытии)
  React.useEffect(() => {
    if (!open) return;
    try {
      if (!vkGroupId) {
        const savedGroupId = window.localStorage.getItem(VK_GROUP_ID_STORAGE_KEY);
        if (savedGroupId && savedGroupId.trim()) {
          setVkGroupId(savedGroupId.trim());
        }
      }
      const savedFromGroup = window.localStorage.getItem(VK_FROM_GROUP_STORAGE_KEY);
      if (savedFromGroup === '0') setVkFromGroup(false);
      if (savedFromGroup === '1') setVkFromGroup(true);
    } catch {
      // ignore (например, если storage недоступен)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Сохраняем VK groupId (чтобы не вводить каждый раз)
  React.useEffect(() => {
    if (!open) return;
    if (!vkGroupId) return;
    try {
      // сохраняем только цифры, чтобы не тащить мусор
      const normalized = vkGroupId.replace(/\D/g, '');
      if (normalized) {
        window.localStorage.setItem(VK_GROUP_ID_STORAGE_KEY, normalized);
      }
    } catch {
      // ignore
    }
  }, [open, vkGroupId]);

  // Сохраняем флажок "от имени группы"
  React.useEffect(() => {
    if (!open) return;
    try {
      window.localStorage.setItem(VK_FROM_GROUP_STORAGE_KEY, vkFromGroup ? '1' : '0');
    } catch {
      // ignore
    }
  }, [open, vkFromGroup]);

  // Автоподстановка: если есть ровно 1 telegram-чат, сразу выберем его
  React.useEffect(() => {
    if (!open) return;
    if (!connections) return;
    if (platform !== 'TELEGRAM') return;
    if (connections.telegram.length === 1 && connections.telegram[0]?.chatId) {
      setTgChatId(connections.telegram[0].chatId);
    }
  }, [open, connections, platform]);

  const handleConnectTelegram = async () => {
    if (!tgBotToken.trim() || !tgChatId.trim()) {
      toast.error('Укажи bot token и chatId');
      return;
    }

    setIsConnectingTelegram(true);
    try {
      const res = await fetch('/api/social/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          platform: 'TELEGRAM',
          botToken: tgBotToken.trim(),
          chatId: tgChatId.trim(),
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string; details?: unknown };
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось подключить Telegram');
      }
      toast.success('Telegram подключён');
      await loadConnections();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка подключения Telegram');
    } finally {
      setIsConnectingTelegram(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const scheduleIso = scheduleEnabled ? toIsoFromDatetimeLocal(scheduleFor) : null;
      if (scheduleEnabled && !scheduleIso) {
        toast.error('Укажи корректную дату/время публикации');
        return;
      }

      // Telegram не умеет принимать data: URL как photo — нужен публичный URL.
      // Для визиток мы часто имеем thumbnailUrl как data:... поэтому, если Cloudinary настроен,
      // грузим картинку туда и используем полученный URL.
      let finalImageUrl = imageUrl;
      if (platform === 'TELEGRAM' && finalImageUrl?.startsWith('data:')) {
        try {
          const blobRes = await fetch(finalImageUrl);
          const blob = await blobRes.blob();
          const file = new File([blob], `social-${Date.now()}.png`, { type: blob.type || 'image/png' });

          const form = new FormData();
          form.append('file', file);
          form.append('folder', 'social');

          const uploadRes = await fetch('/api/cloudinary/upload', {
            method: 'POST',
            body: form,
          });
          const uploadData = (await uploadRes.json()) as { success?: boolean; url?: string; error?: string };
          if (!uploadRes.ok || !uploadData.url) {
            throw new Error(uploadData.error || 'Cloudinary upload failed');
          }

          finalImageUrl = uploadData.url;
        } catch (e) {
          toast.error(
            e instanceof Error
              ? e.message
              : 'Для Telegram нужен публичный URL изображения (настрой Cloudinary или используй генерации/редакты)'
          );
          return;
        }
      }

      const payload: Record<string, unknown> = {
        platform,
        contentType,
        contentId,
        imageUrl: finalImageUrl,
        caption: caption || undefined,
        scheduleFor: scheduleIso || undefined,
      };

      if (platform === 'VK') {
        const groupId = Number(vkGroupId);
        if (!Number.isInteger(groupId) || groupId <= 0) {
          toast.error('Укажи корректный groupId (число)');
          return;
        }
        payload.vk = { groupId, fromGroup: vkFromGroup };
      }

      if (platform === 'TELEGRAM') {
        // chatId можно не слать, если подключение одно — backend сам выберет
        payload.telegram = { chatId: tgChatId.trim() ? tgChatId.trim() : undefined };
      }

      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        success?: boolean;
        scheduled?: boolean;
        post?: { id?: string };
        externalId?: string;
        error?: string;
        details?: string;
      };

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Ошибка публикации');
      }

      if (data.scheduled) {
        toast.success('Публикация запланирована');

        // Без UI-менеджера удобно сразу иметь ID (для отмены через API)
        const scheduledId = data.post?.id;
        if (scheduledId) {
          try {
            await navigator.clipboard.writeText(scheduledId);
            toast.info('ID запланированной публикации скопирован (можно отменить через /api/social/schedule)');
          } catch {
            // ignore
          }
        }
      } else {
        toast.success('Опубликовано!');

        // Для VK удобно сразу получить ссылку на пост
        if (platform === 'VK' && data.externalId) {
          const groupId = Number(vkGroupId.replace(/\D/g, ''));
          if (Number.isInteger(groupId) && groupId > 0) {
            const vkUrl = `https://vk.com/wall-${groupId}_${data.externalId}`;
            try {
              await navigator.clipboard.writeText(vkUrl);
              toast.info('Ссылка на VK-пост скопирована');
            } catch {
              // ignore
            }
          }
        }
      }

      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось опубликовать');
    } finally {
      setIsPublishing(false);
    }
  };

  const vkConnected = connections?.vk.connected ?? false;
  const telegramConnectedCount = connections?.telegram.filter(t => t.connected && t.chatId).length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Публикация в соцсети
          </DialogTitle>
          <DialogDescription>
            Выбери платформу, проверь текст и опубликуй сразу или по расписанию.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Платформа */}
          <div className="space-y-2">
            <Label>Платформа</Label>
            <Select value={platform} onChange={(e) => setPlatform(e.target.value as SocialPlatform)}>
              <option value="VK">VK (в группу)</option>
              <option value="TELEGRAM">Telegram</option>
            </Select>
            <div className="text-xs text-muted-foreground">
              {isLoadingConnections ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Проверяем подключения…
                </span>
              ) : platform === 'VK' ? (
                vkConnected ? (
                  <span>VK подключён</span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Link2Off className="h-3.5 w-3.5" />
                    VK не подключён (нужно войти через VK)
                  </span>
                )
              ) : telegramConnectedCount > 0 ? (
                <span>Telegram подключён: {telegramConnectedCount} чат(ов)</span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Link2Off className="h-3.5 w-3.5" />
                  Telegram не подключён (ниже можно подключить)
                </span>
              )}
            </div>
          </div>

          {/* Текст */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Текст публикации</Label>
              <span className="text-xs text-muted-foreground">
                {caption.length}/{captionLimit}
              </span>
            </div>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Например: Новый дизайн готов! Как вам?"
              maxLength={captionLimit}
              className="min-h-[120px]"
            />
          </div>

          {/* VK настройки */}
          {platform === 'VK' && (
            <div className="space-y-3 rounded-md border p-4">
              <div className="font-medium">VK: публикация в группу</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>groupId</Label>
                  <Input
                    inputMode="numeric"
                    value={vkGroupId}
                    onChange={(e) => setVkGroupId(e.target.value)}
                    placeholder="Например: 123456789"
                  />
                  <p className="text-xs text-muted-foreground">
                    Это числовой ID группы (без минуса). В API мы сами сделаем owner_id = -groupId.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>От имени группы</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="vk-from-group"
                      checked={vkFromGroup}
                      onCheckedChange={(checked) => setVkFromGroup(Boolean(checked))}
                    />
                    <Label htmlFor="vk-from-group" className="cursor-pointer">
                      from_group=1
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Если выключить — пост может уйти “от вашего пользователя” (если VK разрешит).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Telegram настройки + подключение */}
          {platform === 'TELEGRAM' && (
            <div className="space-y-3 rounded-md border p-4">
              <div className="font-medium">Telegram</div>

              {telegramConnectedCount > 0 && (
                <div className="space-y-2">
                  <Label>Куда отправлять (chatId)</Label>
                  <Select value={tgChatId} onChange={(e) => setTgChatId(e.target.value)}>
                    <option value="">(выбрать автоматически, если подключение одно)</option>
                    {connections?.telegram
                      .filter(t => t.connected && t.chatId)
                      .map((t) => (
                        <option key={t.chatId ?? 'null'} value={t.chatId ?? ''}>
                          {t.chatId}
                        </option>
                      ))}
                  </Select>
                </div>
              )}

              {telegramConnectedCount === 0 && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Bot token</Label>
                      <Input
                        value={tgBotToken}
                        onChange={(e) => setTgBotToken(e.target.value)}
                        placeholder="123456:ABCDEF..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>chatId</Label>
                      <Input
                        value={tgChatId}
                        onChange={(e) => setTgChatId(e.target.value)}
                        placeholder="Например: 123456789 или @channel"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConnectTelegram}
                    disabled={isConnectingTelegram}
                    className="w-full sm:w-auto"
                  >
                    {isConnectingTelegram ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Подключаем…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Подключить Telegram
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Планирование */}
          <div className="space-y-3 rounded-md border p-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <div className="font-medium">Планирование</div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="schedule"
                checked={scheduleEnabled}
                onCheckedChange={(checked) => setScheduleEnabled(Boolean(checked))}
              />
              <Label htmlFor="schedule" className="cursor-pointer">
                Запланировать публикацию
              </Label>
            </div>

            {scheduleEnabled && (
              <div className="space-y-2">
                <Label>Дата и время</Label>
                <Input
                  type="datetime-local"
                  value={scheduleFor}
                  onChange={(e) => setScheduleFor(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Важно: время берётся из твоего компьютера (локальная таймзона).
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
            Отмена
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправляем…
              </>
            ) : scheduleEnabled ? (
              <>
                <CalendarClock className="h-4 w-4" />
                Запланировать
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Опубликовать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


