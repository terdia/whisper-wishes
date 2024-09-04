import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login')
      }
    }, [user, isLoading, router])

    if (isLoading) {
      return <LoadingSpinner fullScreen />
    }

    if (!user) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

export default withAuth