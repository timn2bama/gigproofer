import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/blob';

export const dynamic = 'force-dynamic';

const VALID_PLATFORMS = ['Uber', 'Lyft', 'DoorDash', 'Instacart', 'Grubhub', 'Amazon Flex', 'Shipt', 'TaskRabbit', 'Other'];
const VALID_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'heic'];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const contentType = request.headers.get('content-type') ?? '';

    let blobUrl: string;
    let filename: string;
    let platform: string;

    if (contentType.includes('multipart/form-data')) {
      // New path: client sends file + platform as FormData
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      platform = formData.get('platform') as string ?? '';
      if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

      filename = file.name;
      const ext = filename.split('.').pop()?.toLowerCase() ?? '';
      if (!VALID_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: 'Invalid file type. Only PDF, JPEG, PNG, and HEIC files are allowed.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadFile(filename, buffer, file.type);
      blobUrl = result.url;
    } else {
      // Legacy path: client already uploaded and sends blob URL as cloud_storage_path
      const body = await request.json();
      blobUrl = body.cloud_storage_path;
      filename = body.filename;
      platform = body.platform;

      const ext = filename?.split('.').pop()?.toLowerCase() ?? '';
      if (!VALID_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: 'Invalid file type. Only PDF, JPEG, PNG, and HEIC files are allowed.' }, { status: 400 });
      }
    }

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true },
    });

    if (user?.subscriptionStatus !== 'active') {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
    }

    const document = await prisma.document.create({
      data: {
        userId,
        filename,
        cloudStoragePath: blobUrl,
        platform,
        processingStatus: 'processing',
      },
    });

    processDocumentAsync(document.id, blobUrl, userId, platform)
      .catch(async (err) => {
        console.error(`Document processing failed for ${document.id}:`, err);
        await prisma.document.update({
          where: { id: document.id },
          data: { processingStatus: 'failed' },
        }).catch(() => {});
      });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
  }
}

async function processDocumentAsync(
  documentId: string,
  blobUrl: string,
  userId: string,
  platform: string
) {
  try {
    // Blob URL is directly fetchable — no signed URL needed
    const response = await fetch(blobUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');

    const fileExtension = blobUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
    let dataUri = '';
    if (fileExtension === 'pdf') {
      dataUri = `data:application/pdf;base64,${base64String}`;
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension ?? '')) {
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      dataUri = `data:${mimeType};base64,${base64String}`;
    }

    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: fileExtension === 'pdf'
              ? [
                  { type: 'file', file: { filename: 'earnings.pdf', file_data: dataUri } },
                  { type: 'text', text: `Extract all income/earnings information from this ${platform} earnings statement. For each payment or earning entry, extract: date (YYYY-MM-DD format), amount (number only, no currency symbols), and payment type (e.g., weekly, daily, tips, bonus). Return ONLY a JSON array with this exact structure:\n\n[{"date": "2026-01-15", "amount": 450.50, "paymentType": "weekly"}]\n\nIMPORTANT: Return raw JSON only, no markdown, no code blocks, no explanations. If no income data is found, return an empty array [].` },
                ]
              : [
                  { type: 'text', text: `Extract all income/earnings information from this ${platform} earnings statement image. For each payment or earning entry, extract: date (YYYY-MM-DD format), amount (number only, no currency symbols), and payment type (e.g., weekly, daily, tips, bonus). Return ONLY a JSON array with this exact structure:\n\n[{"date": "2026-01-15", "amount": 450.50, "paymentType": "weekly"}]\n\nIMPORTANT: Return raw JSON only, no markdown, no code blocks, no explanations. If no income data is found, return an empty array [].` },
                  { type: 'image_url', image_url: { url: dataUri } },
                ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
      }),
    });

    if (!llmResponse.ok) throw new Error('LLM API request failed');

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content ?? '{}';

    let extractedData: any[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) extractedData = parsed;
      else if (parsed.records && Array.isArray(parsed.records)) extractedData = parsed.records;
      else if (parsed.earnings && Array.isArray(parsed.earnings)) extractedData = parsed.earnings;
      else if (parsed.income && Array.isArray(parsed.income)) extractedData = parsed.income;
    } catch {}

    for (const record of extractedData) {
      try {
        await prisma.incomeRecord.create({
          data: {
            userId,
            documentId,
            date: new Date(record.date),
            amount: parseFloat(record.amount),
            platform,
            paymentType: record.paymentType || null,
          },
        });
      } catch (err) {
        console.error('Failed to create income record:', err);
      }
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: 'completed' },
    });
  } catch (error) {
    console.error('Document processing error:', error);
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: 'failed' },
    });
  }
}
