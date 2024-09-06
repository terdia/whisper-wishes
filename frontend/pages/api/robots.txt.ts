import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host || 'example.com'
  const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://${host}/api/sitemap.xml
`

  res.setHeader('Content-Type', 'text/plain')
  res.write(robotsTxt)
  res.end()
}