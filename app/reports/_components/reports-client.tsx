'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Home, FileText, Download, Loader2, CheckCircle } from 'lucide-react';

interface Report {
  id: string;
  generatedAt: string;
  totalIncome: number;
  averageMonthly: number;
  consistencyScore: number;
  cloudStoragePath: string;
  reportData: any;
}

interface Props {
  user: {
    subscriptionStatus: string;
    name: string | null;
    email: string | null;
  };
  reports: Report[];
}

export function ReportsClient({ user, reports }: Props) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    if (user.subscriptionStatus !== 'active') {
      setError('Please subscribe to generate reports');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate report');
      }

      router.refresh();
    } catch (error: any) {
      console.error('Report generation error:', error);
      setError(error?.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const data = await response.json();
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `GigProofer-Report-${reportId}.pdf`;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verification Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Generate and download professional income verification reports
            </p>
          </div>

          {/* Generate Report Section */}
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1 dark:text-white">Generate New Report</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a comprehensive income verification report for lenders
                </p>
              </div>
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || user.subscriptionStatus !== 'active'}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-800 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {user.subscriptionStatus !== 'active' && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-lg text-orange-800 dark:text-orange-300 text-sm">
                <p>Subscribe to generate verification reports.</p>
                <Link href="/subscription">
                  <Button size="sm" className="mt-2">
                    Subscribe Now
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Reports List */}
          <div>
            <h2 className="text-xl font-semibold dark:text-white mb-4">Generated Reports</h2>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <Card className="p-8 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p>No reports generated yet</p>
                </Card>
              ) : (
                reports.map((report) => (
                  <Card key={report.id} className="p-6 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <h3 className="font-semibold dark:text-white">Income Verification Report</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                            <p className="text-gray-600 dark:text-gray-400">Consistency Score</p>
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
                        className="flex items-center gap-2 ml-4"
                      >
                        <Download className="h-4 w-4" />
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
