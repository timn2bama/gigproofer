'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { generatePresignedUploadUrl } from '@/lib/s3';

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

    const { fileName, contentType, isPublic } = formData;

    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
      fileName,
      contentType,
      isPublic ?? false
    );

    return { success: true, uploadUrl, cloud_storage_path };
  } catch (error: any) {
    console.error('Server Action Error (getPresignedUrl):', error);
    return { success: false, error: error.message || 'Failed to generate upload URL' };
  }
}
