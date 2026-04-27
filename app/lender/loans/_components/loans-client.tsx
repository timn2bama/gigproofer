'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Home,
  Users,
  FileText,
  LogOut,
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface FundedLoan {
  id: string;
  loanAmount: number;
  commissionAmount: number;
  status: string;
  fundedDate: string;
  notes?: string;
  worker: {
    id: string;
    name: string;
    email: string;
  };
  report: {
    id: string;
    totalIncome: number;
    averageMonthly: number;
    consistencyScore: number;
    generatedAt: string;
  };
}

interface Summary {
  totalLoans: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
}

interface LoansClientProps {
  availableReports: Array<{
    id: string;
    userId: string;
    generatedAt: string;
    totalIncome: number;
    averageMonthly: number;
    consistencyScore: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export function LoansClient({ availableReports }: LoansClientProps) {
  const router = useRouter();
  const [fundedLoans, setFundedLoans] = useState<FundedLoan[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalLoans: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    reportId: '',
    loanAmount: '',
    commissionAmount: '30',
    fundedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchFundedLoans();
  }, []);

  const fetchFundedLoans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/lender/loans');
      if (!response.ok) throw new Error('Failed to fetch funded loans');
      const data = await response.json();
      setFundedLoans(data.fundedLoans);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching funded loans:', error);
      setError('Failed to load funded loans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/lender/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          loanAmount: parseFloat(formData.loanAmount),
          commissionAmount: parseFloat(formData.commissionAmount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to report funded loan');
      }

      setSuccess('Funded loan reported successfully!');
      setShowForm(false);
      setFormData({
        reportId: '',
        loanAmount: '',
        commissionAmount: '30',
        fundedDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      await fetchFundedLoans();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
              <Button variant="ghost" size="sm" className="bg-gray-100 dark:bg-gray-800">
                <DollarSign className="h-4 w-4 mr-2" />
                Funded Loans
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Funded Loans
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your funded loans and commission earnings
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Report Funded Loan
            </Button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg text-green-800 dark:text-green-300">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Report Form */}
          {showForm && (
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Report New Funded Loan
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="reportId" className="dark:text-gray-300">
                    Verification Report
                  </Label>
                  <select
                    id="reportId"
                    value={formData.reportId}
                    onChange={(e) =>
                      setFormData({ ...formData, reportId: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select a report...</option>
                    {availableReports.map((report) => (
                      <option key={report.id} value={report.id}>
                        {report.user.name} - {formatCurrency(report.totalIncome)} ({
                          formatDate(report.generatedAt)
                        })
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="loanAmount" className="dark:text-gray-300">
                    Loan Amount
                  </Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.loanAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, loanAmount: e.target.value })
                    }
                    placeholder="10000.00"
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="commissionAmount" className="dark:text-gray-300">
                    Commission Amount ($25-$50)
                  </Label>
                  <Input
                    id="commissionAmount"
                    type="number"
                    step="1"
                    min="25"
                    max="50"
                    value={formData.commissionAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commissionAmount: e.target.value,
                      })
                    }
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fundedDate" className="dark:text-gray-300">
                    Funded Date
                  </Label>
                  <Input
                    id="fundedDate"
                    type="date"
                    value={formData.fundedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, fundedDate: e.target.value })
                    }
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="dark:text-gray-300">
                    Notes (Optional)
                  </Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Additional notes about this loan..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

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
                  Pending
                </h3>
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-2xl font-bold dark:text-white">
                {formatCurrency(summary.pendingCommissions)}
              </p>
            </Card>

            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Paid
                </h3>
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold dark:text-white">
                {formatCurrency(summary.paidCommissions)}
              </p>
            </Card>
          </div>

          {/* Funded Loans List */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <div className="p-6 border-b dark:border-gray-800">
              <h3 className="text-lg font-semibold dark:text-white">Funded Loans History</h3>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                  Loading...
                </div>
              ) : fundedLoans.length === 0 ? (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                  No funded loans reported yet.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Worker
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Loan Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Commission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Funded Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {fundedLoans.map((loan) => (
                      <tr
                        key={loan.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {loan.worker.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {loan.worker.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(loan.loanAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(loan.commissionAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              loan.status === 'paid'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            }`}
                          >
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(loan.fundedDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {loan.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
