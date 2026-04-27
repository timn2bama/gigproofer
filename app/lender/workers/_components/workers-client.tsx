'use client';

import { useState, useMemo } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, Users, LogOut, FileText, DollarSign, BarChart3 } from 'lucide-react';

interface Worker {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  _count: {
    incomeRecords: number;
    verificationReports: number;
  };
}

interface Props {
  workers: Worker[];
}

export function WorkersClient({ workers }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const search = searchQuery.toLowerCase();
      return (
        worker.name?.toLowerCase().includes(search) ||
        worker.email?.toLowerCase().includes(search)
      );
    });
  }, [workers, searchQuery]);

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Browse gig workers with verified income
            </p>
          </div>

          {/* Search */}
          <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Card>

          {/* Workers List */}
          <div className="space-y-3">
            {filteredWorkers.length === 0 ? (
              <Card className="p-8 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800">
                <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p>No workers found</p>
              </Card>
            ) : (
              filteredWorkers.map((worker) => (
                <Card key={worker.id} className="p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg dark:text-white">
                        {worker.name ?? 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{worker.email}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Income Records: </span>
                          <span className="font-medium dark:text-gray-300">
                            {worker._count.incomeRecords}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Reports: </span>
                          <span className="font-medium dark:text-gray-300">
                            {worker._count.verificationReports}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Joined: </span>
                          <span className="font-medium dark:text-gray-300">
                            {new Date(worker.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/lender/workers/${worker.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredWorkers.length} of {workers.length} workers
          </div>
        </div>
      </main>
    </div>
  );
}
