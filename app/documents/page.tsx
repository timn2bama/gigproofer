import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { DocumentsClient } from './_components/documents-client';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true },
  });

  const documents = await prisma.document.findMany({
    where: { userId },
    orderBy: { uploadDate: 'desc' },
    include: {
      incomeRecords: true,
    },
  });

  return (
    <DocumentsClient
      subscriptionStatus={user?.subscriptionStatus ?? 'inactive'}
      documents={documents.map(doc => ({
        ...doc,
        uploadDate: doc.uploadDate.toISOString(),
        incomeRecords: doc.incomeRecords.map(record => ({
          ...record,
          date: record.date.toISOString(),
          extractedAt: record.extractedAt.toISOString(),
        })),
      }))}
    />
  );
}
