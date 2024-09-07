import { NextApiRequest, NextApiResponse } from 'next'

const generateSiteMap = (host: string) => {
  const baseUrl = `https://${host}`

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${baseUrl}</loc>
     </url>
     <url>
       <loc>${baseUrl}/global-garden</loc>
     </url>
     <url>
       <loc>${baseUrl}/my-wishes</loc>
     </url>
     <url>
       <loc>${baseUrl}/how-it-works</loc>
     </url>
     <url>
       <loc>${baseUrl}/login</loc>
     </url>
     <url>
       <loc>${baseUrl}/signup</loc>
     </url>
     <url>
       <loc>${baseUrl}/magic-link</loc>
     </url>
     <url>
       <loc>${baseUrl}/terms-of-service</loc>
     </url>
     <url>
       <loc>${baseUrl}/privacy-policy</loc>
     </url>
   </urlset>
 `
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/xml')

  try {
    const host = req.headers.host || 'dandywishes.app'
    const sitemap = generateSiteMap(host)
    res.write(sitemap)
    res.end()
  } catch (e) {
    console.error('Error generating sitemap:', e)
    res.status(500).end()
  }
}