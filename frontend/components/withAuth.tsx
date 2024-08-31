import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!user) {
        router.push('/login')
      }
    }, [user, router])

    if (!user) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

export default withAuth