type TelegramOk<T> = { ok: true; result: T };
type TelegramFail = { ok: false; description?: string };

function isTelegramOk<T>(data: unknown): data is TelegramOk<T> {
  return !!data && typeof data === 'object' && 'ok' in data && (data as { ok: unknown }).ok === true;
}

export async function telegramSendPhoto(params: {
  botToken: string;
  chatId: string | number;
  imageUrl: string;
  caption?: string;
}): Promise<{ messageId: number }> {
  const url = `https://api.telegram.org/bot${params.botToken}/sendPhoto`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: params.chatId,
      photo: params.imageUrl,
      caption: params.caption,
    }),
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    throw new Error(`Telegram HTTP ${res.status}`);
  }
  if (!isTelegramOk<{ message_id: number }>(data)) {
    const description =
      data && typeof data === 'object' && 'description' in data
        ? String((data as TelegramFail).description || 'Unknown error')
        : 'Unknown error';
    throw new Error(`Telegram API error: ${description}`);
  }

  return { messageId: data.result.message_id };
}


