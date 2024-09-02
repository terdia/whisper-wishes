import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react';

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login')
      }
    }, [user, isLoading])

    if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto" />
              <p className="mt-2 text-gray-600">Loading Dandy Wishes...</p>
            </div>
          </div>
        );
      }

    if (!user) {
      return null // or a "not authorized" component
    }

    return <WrappedComponent {...props} />
  }
}

export default withAuth