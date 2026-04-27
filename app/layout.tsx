import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'GigProofer - Income Verification for Gig Workers | Uber, DoorDash, Instacart',
    template: '%s | GigProofer',
  },
  description:
    'Transform your gig income into lender-ready documentation. AI-powered income verification for Uber, Lyft, DoorDash, Instacart drivers. Get approved for loans, apartments, and credit cards with verified gig worker income reports.',
  keywords: [
    'gig worker income verification',
    'uber driver income proof',
    'doordash income verification',
    'instacart earnings verification',
    'lyft driver proof of income',
    'gig economy income documentation',
    'freelancer income verification',
    'rideshare driver income',
    'delivery driver income proof',
    'loan application gig worker',
    'apartment rental gig income',
    'income verification app',
    'AI income verification',
    'gig worker loan approval',
  ],
  authors: [{ name: 'GigProofer' }],
  creator: 'GigProofer',
  publisher: 'GigProofer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: 'GigProofer',
    title: 'GigProofer - Income Verification for Gig Workers',
    description:
      'Transform your gig income into lender-ready documentation. AI-powered income verification for Uber, Lyft, DoorDash, Instacart drivers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GigProofer - Income Verification for Gig Workers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GigProofer - Income Verification for Gig Workers',
    description:
      'Transform your gig income into lender-ready documentation. Get approved for loans, apartments, and more.',
    images: ['/og-image.png'],
    creator: '@gigproofer',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you get them from Google Search Console
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async></script>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
