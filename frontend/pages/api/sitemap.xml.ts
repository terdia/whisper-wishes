import { NextApiRequest, NextApiResponse } from 'next'

const generateSiteMap = async (host: string) => {
  const baseUrl = `https://${host}`
  const pages = [
    '',
    '/global-garden',
    '/my-wishes',
    '/how-it-works',
    '/login',
    '/signup',
    '/welcome',
    '/magic-link',
    '/terms-of-service',
    '/privacy-policy',
    '/check-email',
    '/create-wish',
    '/my-amplified-wishes',
    '/subscription',
    '/profile',
    '/wishboard'
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${pages.map(page => `
     <url>
       <loc>${baseUrl}${page}</loc>
     </url>
     `).join('')}
   </urlset>
 `
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/xml')

  try {
    const host = req.headers.host || 'www.dandywishes.app'
    const sitemap = await generateSiteMap(host)
    res.write(sitemap)
    res.end()
  } catch (e) {
    console.error('Error generating sitemap:', e)
    res.status(500).end()
  }
}