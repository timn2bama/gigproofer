import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { SubscriptionClient } from './_components/subscription-client';

export const dynamic = 'force-dynamic';

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscription: true,
    },
  });

  return (
    <SubscriptionClient
      subscriptionStatus={user?.subscriptionStatus ?? 'inactive'}
      subscription={user?.subscription ? {
        id: user.subscription.id,
        status: user.subscription.status,
        currentPeriodStart: user.subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: user.subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      } : null}
    />
  );
}
