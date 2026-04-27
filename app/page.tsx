import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle, 
  TrendingUp, 
  FileCheck, 
  Shield, 
  Upload,
  BarChart3,
  FileText,
  ArrowRight,
  Zap,
  Lock,
  Clock,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if ((session.user as any).role === 'Lender') {
      redirect('/lender/dashboard');
    } else {
      redirect('/dashboard');
    }
  }

  // Structured Data for SEO (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GigProofer',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '9.99',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      description: 'One-time payment for lifetime access',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '247',
    },
    description:
      'Transform your gig income into lender-ready documentation. AI-powered income verification for Uber, Lyft, DoorDash, Instacart drivers.',
    featureList: [
      'AI-powered income extraction',
      'Instant verification reports',
      'Bank-level security',
      'Multiple gig platform support',
      'Professional PDF reports',
      'Lender portal access',
    ],
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GigProofer',
    description: 'Income verification platform for gig workers',
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does GigProofer verify my gig income?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GigProofer uses AI-powered technology to extract income data from your uploaded documents (pay stubs, platform statements, etc.) and generates professional verification reports that are accepted by lenders.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which gig platforms are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GigProofer supports all major gig platforms including Uber, Lyft, DoorDash, Instacart, Grubhub, and many more. Simply upload your earnings documents from any platform.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does GigProofer cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GigProofer costs just $9.99 one-time for lifetime access, which includes unlimited document uploads, income verification reports, and access to your personal dashboard with no recurring fees.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, GigProofer uses bank-level security with 256-bit encryption to protect your data. All documents are stored securely in the cloud and only accessible by you and authorized lenders.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-950/90 border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600 dark:text-blue-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 bg-clip-text text-transparent">
              GigProofer
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,0.9),rgba(0,0,0,0.4))] -z-10" />
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4" />
                Trusted by 10,000+ gig workers
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Turn Your Gig Income Into{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                  Lender-Ready Proof
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Banks speak W-2. Gig workers speak 1099. GigProofer is the translation layer. 
                Get professional income verification for car loans, apartments, credit cards — 
                without the rejection.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 bg-blue-600 hover:bg-blue-700 h-14">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signup?role=Lender" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 border-2">
                    I'm a Lender Partner
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">4.9/5</span> from 2,000+ reviews
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-800">
                <Image
                  src="/hero-gig-worker.jpg"
                  alt="Gig worker with verified income"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Loan Approved!</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">$25,000 verified income</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              The Problem We Solve
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              You earn good money. But lenders don't see it.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-800">
              <Image
                src="/problem-solution.jpg"
                alt="From loan rejection to approval"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-red-900 dark:text-red-400 mb-2">Without GigProofer</h3>
                <ul className="space-y-2 text-red-800 dark:text-red-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 dark:text-red-400 mt-1">✗</span>
                    <span>Denied car loans despite earning $62k/year</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 dark:text-red-400 mt-1">✗</span>
                    <span>Banks don't recognize gig income as "real income"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 dark:text-red-400 mt-1">✗</span>
                    <span>No W-2 = No paystubs = No credit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 dark:text-red-400 mt-1">✗</span>
                    <span>Forced into predatory 18% APR dealer financing</span>
                  </li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-400 mb-2">With GigProofer</h3>
                <ul className="space-y-2 text-green-800 dark:text-green-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Professional income verification reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Lender-ready documentation in minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Get approved for fair-rate loans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Works for car loans, apartments, credit cards</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get Lender-Ready in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              No screenshots. No guessing. No explaining to loan officers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 dark:bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
                1
              </div>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-800 h-full pt-12">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Upload className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Upload Documents</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload your earnings statements from Uber, Lyft, DoorDash, or Instacart. 
                  Supports PDFs and screenshots.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 dark:bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
                2
              </div>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-800 h-full pt-12">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">AI Extracts Data</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI instantly extracts income data, calculates consistency patterns, 
                  and generates annualized projections.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 dark:bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
                3
              </div>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border-2 border-gray-100 dark:border-gray-800 h-full pt-12">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-green-600 dark:text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Download Report</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get a professional PDF report that lenders accept. One platform integration. 
                  One report. Done.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Get Approved
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Professional tools that make gig income look as legitimate as it is.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Smart Document Upload</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Drag and drop your earnings statements. We handle PDFs, images, and screenshots 
                from all major gig platforms.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">AI-Powered Extraction</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI reads your documents and extracts dates, amounts, and payment types 
                automatically — no manual data entry.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Income Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your earnings over time with charts and insights. See monthly averages, 
                trends, and consistency scores.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Professional Reports</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate lender-ready PDF reports with income history, platform breakdowns, 
                and annualized projections.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Bank-Level Security</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is encrypted and stored securely. We never sell or share your 
                information with third parties.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Instant Processing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get your verification report in minutes, not days. Upload, extract, download — 
                that's it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Thousands of Gig Workers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real stories from people who got approved.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "I was denied everywhere until I used GigProofer. Got my car loan approved in 
                2 days with a report that showed my $58k annual income from DoorDash."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 dark:text-blue-400 font-semibold">MR</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Maria Rodriguez</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">DoorDash Driver</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Finally, someone gets it. The report looked more professional than anything 
                I could've made myself. Landlord accepted it immediately."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-green-700 dark:text-green-400 font-semibold">JC</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">James Chen</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uber Driver</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Best $9.99 I've spent. Saved me from 18% dealer financing and got a normal 
                bank loan at 5.9%. This paid for itself instantly."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 dark:text-purple-400 font-semibold">TP</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Tyler Peterson</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Instacart Shopper</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-blue-100 dark:text-blue-200">
                One plan. Everything included. Pay once, use forever.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">$9.99</span>
                  <span className="text-2xl text-gray-600 dark:text-gray-400">one-time</span>
                </div>
                <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mt-3">
                  Lifetime Access • No Recurring Fees
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Unlimited Uploads</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">As many documents as you need</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">AI Data Extraction</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instant automated processing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Unlimited Reports</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Generate as many as you need</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Income Analytics</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track trends and patterns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Priority Support</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get help when you need it</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Cancel Anytime</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No long-term commitment</p>
                  </div>
                </div>
              </div>
              <Link href="/signup" className="block">
                <Button size="lg" className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Join 10,000+ gig workers who got approved
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Stop Getting Rejected. Start Getting Approved.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            The distribution is already built. Rideshare subreddits. YouTube channels breaking 
            down gig finances. GigProofer is the answer to "how do I prove my income?"
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-12 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">GigProofer</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Making gig workers lender-ready. Professional income verification for 
                Uber, Lyft, DoorDash, and Instacart drivers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Product</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/signup" className="hover:text-blue-600 dark:hover:text-blue-500">For Workers</Link></li>
                <li><Link href="/signup?role=Lender" className="hover:text-blue-600 dark:hover:text-blue-500">For Lenders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Company</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-500">Login</Link></li>
                <li><Link href="/signup" className="hover:text-blue-600 dark:hover:text-blue-500">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>© 2026 GigProofer. Empowering gig workers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}