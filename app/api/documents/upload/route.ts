import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { cloud_storage_path, filename, platform } = await request.json();

    // Check subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true },
    });

    if (user?.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 403 }
      );
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId,
        filename,
        cloudStoragePath: cloud_storage_path,
        platform,
        processingStatus: 'processing',
      },
    });

    // Process document asynchronously
    processDocumentAsync(document.id, cloud_storage_path, userId, platform);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to save document' },
      { status: 500 }
    );
  }
}

async function processDocumentAsync(
  documentId: string,
  cloudStoragePath: string,
  userId: string,
  platform: string
) {
  try {
    // Get signed URL for the document
    const documentUrl = await getFileUrl(cloudStoragePath, false);

    // Fetch the file
    const response = await fetch(documentUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');

    // Determine file type
    const fileExtension = cloudStoragePath.split('.').pop()?.toLowerCase();
    let dataUri = '';
    
    if (fileExtension === 'pdf') {
      dataUri = `data:application/pdf;base64,${base64String}`;
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension ?? '')) {
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      dataUri = `data:${mimeType};base64,${base64String}`;
    }

    // Call LLM API to extract income data
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
                  {
                    type: 'file',
                    file: {
                      filename: 'earnings.pdf',
                      file_data: dataUri,
                    },
                  },
                  {
                    type: 'text',
                    text: `Extract all income/earnings information from this ${platform} earnings statement. For each payment or earning entry, extract: date (YYYY-MM-DD format), amount (number only, no currency symbols), and payment type (e.g., weekly, daily, tips, bonus). Return ONLY a JSON array with this exact structure:

[{"date": "2026-01-15", "amount": 450.50, "paymentType": "weekly"}]

IMPORTANT: Return raw JSON only, no markdown, no code blocks, no explanations. If no income data is found, return an empty array [].`,
                  },
                ]
              : [
                  {
                    type: 'text',
                    text: `Extract all income/earnings information from this ${platform} earnings statement image. For each payment or earning entry, extract: date (YYYY-MM-DD format), amount (number only, no currency symbols), and payment type (e.g., weekly, daily, tips, bonus). Return ONLY a JSON array with this exact structure:

[{"date": "2026-01-15", "amount": 450.50, "paymentType": "weekly"}]

IMPORTANT: Return raw JSON only, no markdown, no code blocks, no explanations. If no income data is found, return an empty array [].`,
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: dataUri,
                    },
                  },
                ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error('LLM API request failed');
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content ?? '{}';
    
    // Parse the extracted data
    let extractedData: any[] = [];
    try {
      const parsed = JSON.parse(content);
      // Handle different response structures
      if (Array.isArray(parsed)) {
        extractedData = parsed;
      } else if (parsed.records && Array.isArray(parsed.records)) {
        extractedData = parsed.records;
      } else if (parsed.earnings && Array.isArray(parsed.earnings)) {
        extractedData = parsed.earnings;
      } else if (parsed.income && Array.isArray(parsed.income)) {
        extractedData = parsed.income;
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
    }

    // Create income records
    if (extractedData.length > 0) {
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
        } catch (error) {
          console.error('Failed to create income record:', error);
        }
      }
    }

    // Update document status
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
