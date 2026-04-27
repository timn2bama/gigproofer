'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, Home, DollarSign, Calendar, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IncomeRecord {
  id: string;
  date: string;
  amount: number;
  platform: string;
  paymentType: string | null;
}

interface Props {
  records: IncomeRecord[];
}

export function IncomeClient({ records }: Props) {
  const [filterPlatform, setFilterPlatform] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const platforms = useMemo(() => {
    const uniquePlatforms = Array.from(new Set(records.map(r => r.platform)));
    return ['All', ...uniquePlatforms];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesPlatform = filterPlatform === 'All' || record.platform === filterPlatform;
      const matchesSearch = searchQuery === '' || 
        record.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.paymentType?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [records, filterPlatform, searchQuery]);

  const totalIncome = filteredRecords.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold dark:text-white">GigProofer</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Income History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage all your income records
            </p>
          </div>

          {/* Filters */}
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-200">Platform</label>
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-200">Search</label>
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-200">Total (Filtered)</label>
                <div className="h-10 flex items-center px-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                  <span className="font-semibold text-blue-900 dark:text-blue-300">
                    {totalIncome.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Records Table */}
          <Card className="overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Platform
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Payment Type
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        No income records found
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-sm dark:text-gray-300">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {record.platform}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {record.paymentType || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                          ${record.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredRecords.length} of {records.length} total records
          </div>
        </div>
      </main>
    </div>
  );
}
