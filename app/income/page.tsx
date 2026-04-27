import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { IncomeClient } from './_components/income-client';

export const dynamic = 'force-dynamic';

export default async function IncomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const incomeRecords = await prisma.incomeRecord.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  return (
    <IncomeClient
      records={incomeRecords.map(r => ({
        ...r,
        date: r.date.toISOString(),
        extractedAt: r.extractedAt.toISOString(),
      }))}
    />
  );
}
