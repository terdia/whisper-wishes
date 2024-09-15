import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../utils/supabaseClient'

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
    '/profile'
  ]

  // Fetch amplified wish IDs from the database
  const { data: amplifiedWishes, error } = await supabase
    .from('wish_amplifications')
    .select('wish_id')
    .order('amplified_at', { ascending: false })
    .limit(40)

  console.log('Fetched amplified wishes:', amplifiedWishes)

  if (error) {
    console.error('Error fetching amplified wishes:', error)
  } else if (!amplifiedWishes || amplifiedWishes.length === 0) {
    console.log('No amplified wishes found')
  } else {
    // Add amplified wish URLs to the pages array
    amplifiedWishes.forEach(wish => {
      pages.push(`/amplified-wish/${wish.wish_id}`)
    })
  }

  console.log('Final pages array:', pages)

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