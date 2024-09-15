// components/SEO.tsx
import Head from 'next/head'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  noindex?: boolean
}

const SEO: React.FC<SEOProps> = ({ title, description, canonical, ogImage, noindex = false }) => {
  const siteName = 'Dandy Wishes'
  const fullTitle = `${title} | ${siteName}`
  const defaultOgImage = 'https://www.dandywishes.app/og-default-image.jpeg'
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:url" content={canonical || 'https://www.dandywishes.app'} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Dandy_Wishes" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  )
}

export default SEO