import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// GET: Get commission analytics for all lenders (admin view)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get all funded loans
    const allLoans = await prisma.fundedLoan.findMany({
      include: {
        lender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { fundedDate: 'desc' },
    });

    // Calculate overall statistics
    const totalLoans = allLoans.length;
    const totalCommissions = allLoans.reduce(
      (sum, loan) => sum + loan.commissionAmount,
      0
    );
    const pendingCommissions = allLoans
      .filter((loan) => loan.status === 'pending')
      .reduce((sum, loan) => sum + loan.commissionAmount, 0);
    const paidCommissions = allLoans
      .filter((loan) => loan.status === 'paid')
      .reduce((sum, loan) => sum + loan.commissionAmount, 0);
    const totalLoanVolume = allLoans.reduce(
      (sum, loan) => sum + loan.loanAmount,
      0
    );

    // Group by lender
    const lenderStats = allLoans.reduce((acc: any, loan) => {
      const lenderId = loan.lenderId;
      if (!acc[lenderId]) {
        acc[lenderId] = {
          lender: loan.lender,
          totalLoans: 0,
          totalCommissions: 0,
          pendingCommissions: 0,
          paidCommissions: 0,
        };
      }
      acc[lenderId].totalLoans++;
      acc[lenderId].totalCommissions += loan.commissionAmount;
      if (loan.status === 'pending') {
        acc[lenderId].pendingCommissions += loan.commissionAmount;
      } else if (loan.status === 'paid') {
        acc[lenderId].paidCommissions += loan.commissionAmount;
      }
      return acc;
    }, {});

    // Group by month for trends
    const monthlyStats = allLoans.reduce((acc: any, loan) => {
      const month = new Date(loan.fundedDate).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = {
          month,
          loans: 0,
          commissions: 0,
          loanVolume: 0,
        };
      }
      acc[month].loans++;
      acc[month].commissions += loan.commissionAmount;
      acc[month].loanVolume += loan.loanAmount;
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        totalLoans,
        totalCommissions,
        pendingCommissions,
        paidCommissions,
        totalLoanVolume,
        averageCommissionPerLoan:
          totalLoans > 0 ? totalCommissions / totalLoans : 0,
        averageLoanAmount: totalLoans > 0 ? totalLoanVolume / totalLoans : 0,
      },
      lenderStats: Object.values(lenderStats),
      monthlyStats: Object.values(monthlyStats).sort((a: any, b: any) =>
        a.month.localeCompare(b.month)
      ),
      recentLoans: allLoans.slice(0, 10),
    });
  } catch (error) {
    console.error('Get commission analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commission analytics' },
      { status: 500 }
    );
  }
}
