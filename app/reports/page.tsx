import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { ReportsClient } from './_components/reports-client';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true, name: true, email: true },
  });

  const reports = await prisma.verificationReport.findMany({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
  });

  return (
    <ReportsClient
      user={user ?? { subscriptionStatus: 'inactive', name: null, email: null }}
      reports={reports.map(r => ({
        ...r,
        generatedAt: r.generatedAt.toISOString(),
        reportData: r.reportData as any,
      }))}
    />
  );
}
