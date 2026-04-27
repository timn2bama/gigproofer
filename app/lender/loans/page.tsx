import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { LoansClient } from './_components/loans-client';

export default async function LenderLoansPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;

  if (userRole !== 'Lender') {
    redirect('/dashboard');
  }

  // Fetch available verification reports for dropdown
  const reports = await prisma.verificationReport.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { generatedAt: 'desc' },
    take: 50, // Limit to most recent 50 reports
  });

  // Convert Date objects to strings for serialization
  const availableReports = reports.map((report) => ({
    ...report,
    generatedAt: report.generatedAt.toISOString(),
    user: {
      id: report.user.id,
      name: report.user.name || '',
      email: report.user.email || '',
    },
  }));

  return <LoansClient availableReports={availableReports} />;
}
