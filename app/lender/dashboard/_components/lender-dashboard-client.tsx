'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Shield,
  Users,
  FileText,
  DollarSign,
  LogOut,
  Search,
  Download,
  BarChart3,
} from 'lucide-react';

interface Report {
  id: string;
  generatedAt: string;
  totalIncome: number;
  averageMonthly: number;
  consistencyScore: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface Props {
  stats: {
    totalWorkers: number;
    totalReports: number;
    totalIncome: number;
  };
  recentReports: Report[];
}

export function LenderDashboardClient({ stats, recentReports }: Props) {
  const handleDownload = async (reportId: string) => {
    try {
      const response = await fetch(`/api/lender/reports/${reportId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const data = await response.json();
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `Report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/lender/dashboard" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold dark:text-white">GigProofer</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Lender Portal</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/lender/dashboard">
                <Button variant="ghost" size="sm">
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
                <Button variant="ghost" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lender Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and verify gig worker income reports
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Workers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalWorkers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalReports}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Verified Income</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    ${stats.totalIncome.toFixed(0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Reports */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Recent Verification Reports</h2>
              <Link href="/lender/workers">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search Workers
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentReports.length === 0 ? (
                <Card className="p-8 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p>No reports available yet</p>
                </Card>
              ) : (
                recentReports.map((report) => (
                  <Card key={report.id} className="p-4 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="font-semibold dark:text-white">{report.user.name ?? 'Unknown Worker'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{report.user.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Generated</p>
                            <p className="font-medium dark:text-gray-300">
                              {new Date(report.generatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Total Income</p>
                            <p className="font-medium text-green-600 dark:text-green-400">
                              ${report.totalIncome.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Avg Monthly</p>
                            <p className="font-medium dark:text-gray-300">
                              ${report.averageMonthly.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Consistency</p>
                            <p className="font-medium dark:text-gray-300">
                              {(report.consistencyScore * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownload(report.id)}
                        variant="outline"
                        size="sm"
                        className="ml-4"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
