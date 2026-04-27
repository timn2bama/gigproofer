'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Shield,
  TrendingUp,
  FileText,
  Upload,
  LogOut,
  DollarSign,
  Calendar,
  PieChart,
  CreditCard,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface IncomeRecord {
  id: string;
  date: string;
  amount: number;
  platform: string;
  paymentType: string | null;
}

interface Props {
  user: {
    name: string | null;
    email: string | null;
    subscriptionStatus: string;
  };
  incomeRecords: IncomeRecord[];
  totalIncome: number;
  averageMonthly: number;
  platformStats: Record<string, number>;
}

export function DashboardClient({
  user,
  incomeRecords,
  totalIncome,
  averageMonthly,
  platformStats,
}: Props) {
  // Prepare chart data - group by month
  const chartData = incomeRecords
    .reduce((acc, record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = acc.find(item => item.month === monthKey);
      if (existing) {
        existing.income += record.amount;
      } else {
        acc.push({ month: monthKey, income: record.amount });
      }
      return acc;
    }, [] as { month: string; income: number }[])
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  // Platform chart data
  const platformChartData = Object.entries(platformStats).map(([platform, amount]) => ({
    platform,
    amount,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold dark:text-white">GigProofer</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="ghost" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Documents
                </Button>
              </Link>
              <Link href="/income">
                <Button variant="ghost" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Income
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </Link>
              <Link href="/subscription">
                <Button variant="ghost" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscription
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

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your gig income and generate verification reports
            </p>
          </div>

          {/* Subscription Alert */}
          {user.subscriptionStatus !== 'active' && (
            <Card className="border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900 dark:text-orange-300">Subscription Required</p>
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    Subscribe to upload documents and generate reports
                  </p>
                </div>
                <Link href="/subscription">
                  <Button size="sm">Subscribe Now</Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    ${totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    ${averageMonthly.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Records</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {incomeRecords.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Trend */}
            <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Income Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Platform Breakdown */}
            <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Platform Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={platformChartData}>
                  <XAxis dataKey="platform" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/documents">
              <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 hover:shadow-md dark:hover:border-gray-700 transition-all cursor-pointer">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
                <h3 className="font-semibold text-lg mb-1 dark:text-white">Upload Documents</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add your earnings statements from gig platforms
                </p>
              </Card>
            </Link>

            <Link href="/income">
              <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 hover:shadow-md dark:hover:border-gray-700 transition-all cursor-pointer">
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="font-semibold text-lg mb-1 dark:text-white">View Income</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See detailed history of all your income records
                </p>
              </Card>
            </Link>

            <Link href="/reports">
              <Card className="p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 hover:shadow-md dark:hover:border-gray-700 transition-all cursor-pointer">
                <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
                <h3 className="font-semibold text-lg mb-1 dark:text-white">Generate Report</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create lender-ready verification documents
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
