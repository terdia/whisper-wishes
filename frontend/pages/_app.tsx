// pages/_app.tsx

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { AuthProvider } from '../contexts/AuthContext'
import SEO from '../components/SEO'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Script from 'next/script'

interface CustomPageProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

function MyApp({ Component, pageProps }: AppProps<CustomPageProps>) {
  return (
    <>
      <SEO 
        title={pageProps.title || 'Dandy Wishes'}
        description={pageProps.description || 'Make your wishes come true with Dandy Wishes'}
        canonical={pageProps.canonical}
        ogImage={pageProps.ogImage}
      />
      <AuthProvider>
        <Layout>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=G-YVTTSS44DN`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-YVTTSS44DN', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
          <Component {...pageProps} />
          <ToastContainer />
        </Layout>
      </AuthProvider>
    </>
  )
}

export default MyApp