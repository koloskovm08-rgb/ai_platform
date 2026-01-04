export const VK_LIMITS = {
  captionMax: 4000,
} as const;

export const TELEGRAM_LIMITS = {
  captionMax: 1024,
} as const;

function normalizeText(input: string): string {
  return input.replace(/\r\n/g, '\n').trim();
}

function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return input.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

export function formatForVK(params: { imageUrl?: string | null; caption?: string | null }) {
  const caption = params.caption ? truncate(normalizeText(params.caption), VK_LIMITS.captionMax) : undefined;
  const imageUrl = params.imageUrl ?? undefined;

  return {
    imageUrl,
    caption,
  };
}

export function formatForTelegram(params: { imageUrl?: string | null; caption?: string | null }) {
  const caption = params.caption
    ? truncate(normalizeText(params.caption), TELEGRAM_LIMITS.captionMax)
    : undefined;
  const imageUrl = params.imageUrl ?? undefined;

  return {
    imageUrl,
    caption,
  };
}


