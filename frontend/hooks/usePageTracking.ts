import { useEffect } from 'react'
import { useRouter } from 'next/router'

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config: object) => void;
  }
}

export const usePageTracking = () => {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'G-YVTTSS44DN', {
          page_path: url,
        })
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
}
