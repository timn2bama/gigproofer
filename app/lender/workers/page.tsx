import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { WorkersClient } from './_components/workers-client';

export const dynamic = 'force-dynamic';

export default async function WorkersPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'Lender') {
    redirect('/login');
  }

  const workers = await prisma.user.findMany({
    where: { role: 'Worker' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          incomeRecords: true,
          verificationReports: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <WorkersClient
      workers={workers.map(w => ({
        ...w,
        createdAt: w.createdAt.toISOString(),
      }))}
    />
  );
}
