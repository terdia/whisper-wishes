const isDev = process.env.NODE_ENV !== 'production';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: https://www.googletagmanager.com;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://api.stripe.com;
      frame-src 'self' https://www.googletagmanager.com https://js.stripe.com https://hooks.stripe.com;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }
]

module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    if (isDev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots.txt',
      },
    ]
  },
}