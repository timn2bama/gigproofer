'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { uploadFile } from '@/lib/blob';

export async function getPresignedUrlAction(formData: {
  fileName: string;
  contentType: string;
  isPublic?: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    // No-op placeholder — actual upload happens via /api/upload/presigned
    return { success: true, uploadUrl: '/api/upload/presigned', cloud_storage_path: '' };
  } catch (error: any) {
    console.error('Server Action Error (getPresignedUrl):', error);
    return { success: false, error: error.message || 'Failed to generate upload URL' };
  }
}

export async function uploadFileAction(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('Unauthorized');

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadFile(file.name, buffer, file.type);
    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
