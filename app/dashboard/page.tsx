import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { DashboardClient } from './_components/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      subscriptionStatus: true,
    },
  });

  // Fetch income records
  const incomeRecords = await prisma.incomeRecord.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 100,
  });

  // Calculate statistics
  const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0);
  const recordCount = incomeRecords.length;
  const averageMonthly = recordCount > 0 ? (totalIncome / Math.max(1, recordCount / 4)) : 0;

  // Get platform breakdown
  const platformStats = incomeRecords.reduce((acc, record) => {
    acc[record.platform] = (acc[record.platform] || 0) + record.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardClient
      user={user ?? { name: null, email: null, subscriptionStatus: 'inactive' }}
      incomeRecords={incomeRecords.map(r => ({
        ...r,
        date: r.date.toISOString(),
      }))}
      totalIncome={totalIncome}
      averageMonthly={averageMonthly}
      platformStats={platformStats}
    />
  );
}
