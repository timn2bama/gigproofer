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
    if (!session || session.user.role !== 'Lender') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lenderId = session.user.id;
    const { reportId } = await params;

    const report = await prisma.verificationReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const fundedLoan = await prisma.fundedLoan.findFirst({
      where: { lenderId, workerId: report.userId },
    });

    if (!fundedLoan) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // cloudStoragePath is now a Vercel Blob URL — return it directly
    return NextResponse.json({ url: report.cloudStoragePath });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to get download URL' }, { status: 500 });
  }
}
