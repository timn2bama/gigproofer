import { put, del } from '@vercel/blob';

export async function uploadFile(
  filename: string,
  body: Buffer | Blob | ArrayBuffer,
  contentType: string
): Promise<{ url: string }> {
  const blob = await put(filename, body, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  });
  return { url: blob.url };
}

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}
