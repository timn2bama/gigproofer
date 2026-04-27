import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://gigproofer.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/documents', '/income', '/reports', '/lender', '/api'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
