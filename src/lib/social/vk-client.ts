const VK_API_VERSION = '5.131';

type VkApiOk<T> = { response: T };
type VkApiError = { error: { error_code: number; error_msg: string; request_params?: unknown } };

function isVkError(data: unknown): data is VkApiError {
  return !!data && typeof data === 'object' && 'error' in data;
}

async function vkCall<TResponse>(
  method: string,
  params: Record<string, string | number | undefined>,
  accessToken: string
): Promise<TResponse> {
  const url = new URL(`https://api.vk.com/method/${method}`);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('v', VK_API_VERSION);

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString());
  const data: unknown = await res.json();

  if (!res.ok) {
    throw new Error(`VK API HTTP ${res.status} for ${method}`);
  }
  if (isVkError(data)) {
    throw new Error(`VK API ${method} error: ${data.error.error_code} ${data.error.error_msg}`);
  }

  return (data as VkApiOk<TResponse>).response;
}

function getVkOwnerId(target: { type: 'user'; userId: number } | { type: 'group'; groupId: number }) {
  // Для wall.post: owner_id отрицательный для групп
  return target.type === 'group' ? -Math.abs(target.groupId) : target.userId;
}

async function fetchImageAsBlob(imageUrl: string) {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const arrayBuffer = await res.arrayBuffer();
  return new Blob([arrayBuffer], { type: contentType });
}

export async function uploadWallPhoto(params: {
  accessToken: string;
  imageUrl: string;
  target: { type: 'user'; userId: number } | { type: 'group'; groupId: number };
}): Promise<{ attachment: string; ownerId: number; id: number }> {
  // 1) Получаем upload_url
  const uploadServer = await vkCall<{ upload_url: string }>(
    'photos.getWallUploadServer',
    params.target.type === 'group' ? { group_id: params.target.groupId } : { owner_id: params.target.userId },
    params.accessToken
  );

  // 2) Загружаем файл на upload_url
  const blob = await fetchImageAsBlob(params.imageUrl);
  const form = new FormData();
  form.append('photo', blob, 'image.jpg');

  const uploadRes = await fetch(uploadServer.upload_url, { method: 'POST', body: form });
  const uploadData: unknown = await uploadRes.json();

  if (!uploadRes.ok) {
    throw new Error(`VK upload HTTP ${uploadRes.status}`);
  }
  if (
    !uploadData ||
    typeof uploadData !== 'object' ||
    !('server' in uploadData) ||
    !('photo' in uploadData) ||
    !('hash' in uploadData)
  ) {
    throw new Error('Unexpected VK upload response');
  }

  const server = (uploadData as { server: number }).server;
  const photo = (uploadData as { photo: string }).photo;
  const hash = (uploadData as { hash: string }).hash;

  // 3) Сохраняем фото в VK и получаем photo_id
  const saved = await vkCall<Array<{ id: number; owner_id: number }>>(
    'photos.saveWallPhoto',
    {
      server,
      photo,
      hash,
      group_id: params.target.type === 'group' ? params.target.groupId : undefined,
    },
    params.accessToken
  );

  const first = saved?.[0];
  if (!first) {
    throw new Error('VK photos.saveWallPhoto returned empty response');
  }

  const attachment = `photo${first.owner_id}_${first.id}`;
  return { attachment, ownerId: first.owner_id, id: first.id };
}

export async function publishToVKWall(params: {
  accessToken: string;
  target: { type: 'user'; userId: number } | { type: 'group'; groupId: number };
  message?: string;
  imageUrl?: string;
  fromGroup?: boolean;
}): Promise<{ postId: number; attachments?: string }> {
  let attachments: string | undefined;

  if (params.imageUrl) {
    const uploaded = await uploadWallPhoto({
      accessToken: params.accessToken,
      imageUrl: params.imageUrl,
      target: params.target,
    });
    attachments = uploaded.attachment;
  }

  const ownerId = getVkOwnerId(params.target);

  const posted = await vkCall<{ post_id: number }>(
    'wall.post',
    {
      owner_id: ownerId,
      message: params.message,
      attachments,
      from_group: params.target.type === 'group' && params.fromGroup ? 1 : undefined,
    },
    params.accessToken
  );

  return { postId: posted.post_id, attachments };
}


