import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { LenderDashboardClient } from './_components/lender-dashboard-client';

export const dynamic = 'force-dynamic';

export default async function LenderDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'Lender') {
    redirect('/login');
  }

  // Fetch statistics
  const totalWorkers = await prisma.user.count({
    where: { role: 'Worker' },
  });

  const totalReports = await prisma.verificationReport.count();

  const recentReports = await prisma.verificationReport.findMany({
    take: 10,
    orderBy: { generatedAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const totalIncome = await prisma.incomeRecord.aggregate({
    _sum: { amount: true },
  });

  return (
    <LenderDashboardClient
      stats={{
        totalWorkers,
        totalReports,
        totalIncome: totalIncome._sum.amount ?? 0,
      }}
      recentReports={recentReports.map(r => ({
        ...r,
        generatedAt: r.generatedAt.toISOString(),
        reportData: r.reportData as any,
      }))}
    />
  );
}
