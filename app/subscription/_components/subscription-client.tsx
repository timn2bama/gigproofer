'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Home, CheckCircle, CreditCard, Loader2 } from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface Props {
  subscriptionStatus: string;
  subscription: Subscription | null;
}

export function SubscriptionClient({ subscriptionStatus, subscription }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError('');

    // Set a timeout to show an error if redirect takes too long
    const timeoutId = setTimeout(() => {
      setError('Redirect is taking longer than expected. Please try again or check your internet connection.');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No checkout URL received from server');
      }

      // Clear timeout since we got a successful response
      clearTimeout(timeoutId);
      
      // Add a small delay to ensure the loading overlay is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      window.location.href = url;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Checkout error:', error);
      setError(error?.message || 'Failed to start checkout');
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to access billing portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Portal error:', error);
      setError(error?.message || 'Failed to access billing portal');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-lg font-semibold dark:text-white">Redirecting to Stripe...</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Please wait a moment</p>
          </div>
        </div>
      )}

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

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your GigProofer subscription
            </p>
          </div>

          {/* Current Status */}
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">Access Status</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscriptionStatus === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {subscriptionStatus === 'active' ? 'Lifetime Access' : 'No Access'}
                  </div>
                </div>
              </div>
            </div>

            {subscription && subscriptionStatus === 'active' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">You have lifetime access!</p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Purchased on {new Date(subscription.currentPeriodStart).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Enjoy unlimited income verification with no recurring fees.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Pricing */}
          {subscriptionStatus !== 'active' && (
            <Card className="p-8 dark:bg-gray-900 dark:border-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 dark:text-white">GigProofer Lifetime Access</h2>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  $9.99<span className="text-xl font-normal text-gray-600 dark:text-gray-400"> one-time</span>
                </div>
                <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  No recurring fees
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Everything you need to get lender-ready, forever
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="dark:text-gray-300">Unlimited document uploads</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="dark:text-gray-300">AI-powered income extraction</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="dark:text-gray-300">Professional verification reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="dark:text-gray-300">Income analytics dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="dark:text-gray-300">Lender-ready PDF reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="font-semibold dark:text-white">Lifetime access - pay once, use forever</span>
                </div>
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Get Lifetime Access - $9.99'
                )}
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-800 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
