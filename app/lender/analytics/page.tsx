import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { AnalyticsClient } from './_components/analytics-client';

export default async function LenderAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;

  if (userRole !== 'Lender') {
    redirect('/dashboard');
  }

  return <AnalyticsClient />;
}
