import { NextApiRequest, NextApiResponse } from 'next'

const generateSiteMap = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>/</loc>
     </url>
     <url>
       <loc>/global-garden</loc>
     </url>
     <url>
       <loc>/my-wishes</loc>
     </url>
     <url>
       <loc>/how-it-works</loc>
     </url>
     <url>
       <loc>/login</loc>
     </url>
     <url>
       <loc>/signup</loc>
     </url>
     <url>
       <loc>/magic-link</loc>
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