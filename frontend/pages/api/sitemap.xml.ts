import { NextApiRequest, NextApiResponse } from 'next'

const BASE_URL = 'https://www.dandywishes.com'

const generateSiteMap = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${BASE_URL}</loc>
     </url>
     <url>
       <loc>${BASE_URL}/global-garden</loc>
     </url>
     <url>
       <loc>${BASE_URL}/my-wishes</loc>
     </url>
     <url>
       <loc>${BASE_URL}/how-it-works</loc>
     </url>
     <url>
       <loc>${BASE_URL}/login</loc>
     </url>
     <url>
       <loc>${BASE_URL}/signup</loc>
     </url>
     <url>
       <loc>${BASE_URL}/magic-link</loc>
     </url>
   </urlset>
 `
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/xml')

  try {
    const sitemap = generateSiteMap()
    res.write(sitemap)
    res.end()
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}