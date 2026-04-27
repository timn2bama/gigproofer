'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Shield,
  Home,
  Users,
  DollarSign,
  LogOut,
  TrendingUp,
  FileText,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyStats {
  month: string;
  loans: number;
  commissions: number;
  loanVolume: number;
}

interface LenderStats {
  lender: {
    id: string;
    name: string;
    email: string;
  };
  totalLoans: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
}

interface Summary {
  totalLoans: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalLoanVolume: number;
  averageCommissionPerLoan: number;
  averageLoanAmount: number;
}

export function AnalyticsClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [lenderStats, setLenderStats] = useState<LenderStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/lender/commissions');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setSummary(data.summary);
      setMonthlyStats(data.monthlyStats);
      setLenderStats(data.lenderStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load commission analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold dark:text-white">GigProofer</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Lender Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/lender/dashboard">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/lender/workers">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Workers
              </Button>
            </Link>
            <Link href="/lender/loans">
              <Button variant="ghost" size="sm">
                <DollarSign className="h-4 w-4 mr-2" />
                Funded Loans
              </Button>
            </Link>
            <Link href="/lender/analytics">
              <Button variant="ghost" size="sm" className="bg-gray-100 dark:bg-gray-800">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Commission Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of all funded loans and commission earnings
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              Loading analytics...
            </div>
          ) : summary ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Loans
                    </h3>
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold dark:text-white">{summary.totalLoans}</p>
                </Card>

                <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Commissions
                    </h3>
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold dark:text-white">
                    {formatCurrency(summary.totalCommissions)}
                  </p>
                </Card>

                <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Avg Commission
                    </h3>
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold dark:text-white">
                    {formatCurrency(summary.averageCommissionPerLoan)}
                  </p>
                </Card>

                <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Loan Volume
                    </h3>
                    <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-2xl font-bold dark:text-white">
                    {formatCurrency(summary.totalLoanVolume)}
                  </p>
                </Card>
              </div>

              {/* Commission Trend Chart */}
              <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Monthly Commission Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
                    <XAxis
                      dataKey="month"
                      className="text-sm dark:text-gray-400"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      className="text-sm dark:text-gray-400"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="commissions"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Commissions ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Loan Volume Chart */}
              <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">
                  Monthly Loan Volume
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
                    <XAxis
                      dataKey="month"
                      className="text-sm dark:text-gray-400"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      className="text-sm dark:text-gray-400"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="loans" fill="#3b82f6" name="Number of Loans" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Lender Performance */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <div className="p-6 border-b dark:border-gray-800">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Lender Performance
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  {lenderStats.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                      No lender data available yet.
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Lender
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total Loans
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total Commissions
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Pending
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Paid
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {lenderStats.map((stat) => (
                          <tr
                            key={stat.lender.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {stat.lender.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {stat.lender.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {stat.totalLoans}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(stat.totalCommissions)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(stat.pendingCommissions)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(stat.paidCommissions)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
