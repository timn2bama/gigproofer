import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { reportId } = await params;

    const report = await prisma.verificationReport.findFirst({
      where: { id: reportId, userId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // cloudStoragePath is now a Vercel Blob URL — return it directly
    return NextResponse.json({ url: report.cloudStoragePath });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to get download URL' }, { status: 500 });
  }
}
