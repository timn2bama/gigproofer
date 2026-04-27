import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { sendAdminNotification, getFundedLoanNotificationHtml } from '@/lib/notifications';

// GET: Fetch funded loans for the lender
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole !== 'Lender') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get funded loans for this lender
    const fundedLoans = await prisma.fundedLoan.findMany({
      where: { lenderId: userId },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        report: {
          select: {
            id: true,
            totalIncome: true,
            averageMonthly: true,
            consistencyScore: true,
            generatedAt: true,
          },
        },
      },
      orderBy: { fundedDate: 'desc' },
    });

    // Calculate totals
    const totalCommissions = fundedLoans.reduce(
      (sum, loan) => sum + loan.commissionAmount,
      0
    );
    const pendingCommissions = fundedLoans
      .filter((loan) => loan.status === 'pending')
      .reduce((sum, loan) => sum + loan.commissionAmount, 0);
    const paidCommissions = fundedLoans
      .filter((loan) => loan.status === 'paid')
      .reduce((sum, loan) => sum + loan.commissionAmount, 0);

    return NextResponse.json({
      fundedLoans,
      summary: {
        totalLoans: fundedLoans.length,
        totalCommissions,
        pendingCommissions,
        paidCommissions,
      },
    });
  } catch (error) {
    console.error('Get funded loans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funded loans' },
      { status: 500 }
    );
  }
}

// POST: Report a new funded loan
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const lenderId = (session.user as any).id;

    if (userRole !== 'Lender') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, loanAmount, commissionAmount, fundedDate, notes } = body;

    // Validate required fields
    if (!reportId || !loanAmount || !commissionAmount || !fundedDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate commission amount is within range
    if (commissionAmount < 25 || commissionAmount > 50) {
      return NextResponse.json(
        { error: 'Commission amount must be between $25 and $50' },
        { status: 400 }
      );
    }

    // Verify the report exists and get the worker ID
    const report = await prisma.verificationReport.findUnique({
      where: { id: reportId },
      select: { userId: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Verification report not found' },
        { status: 404 }
      );
    }

    // Get lender info for notification
    const lender = await prisma.user.findUnique({
      where: { id: lenderId },
      select: { name: true, email: true },
    });

    // Create the funded loan record
    const fundedLoan = await prisma.fundedLoan.create({
      data: {
        reportId,
        lenderId,
        workerId: report.userId,
        loanAmount,
        commissionAmount,
        fundedDate: new Date(fundedDate),
        notes,
        status: 'pending',
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        report: {
          select: {
            id: true,
            totalIncome: true,
            averageMonthly: true,
            consistencyScore: true,
          },
        },
      },
    });

    // Send admin notification for funded loan commission
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    sendAdminNotification({
      notificationId: process.env.NOTIF_ID_FUNDED_LOAN_COMMISSION || '',
      subject: `🏦 New Funded Loan: ${formatCurrency(commissionAmount)} commission earned!`,
      htmlBody: getFundedLoanNotificationHtml({
        lenderName: lender?.name || 'Unknown Lender',
        lenderEmail: lender?.email || 'N/A',
        workerName: fundedLoan.worker.name || 'Unknown Worker',
        loanAmount: formatCurrency(loanAmount),
        commission: formatCurrency(commissionAmount),
      }),
    }).catch(err => console.error('Failed to send funded loan notification:', err));

    return NextResponse.json(fundedLoan, { status: 201 });
  } catch (error) {
    console.error('Create funded loan error:', error);
    return NextResponse.json(
      { error: 'Failed to create funded loan record' },
      { status: 500 }
    );
  }
}
