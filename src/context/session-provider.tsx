import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import { ReactNode } from 'react'

const AuthProvider = async ({ children }: { children: ReactNode }) => {
  const session = await auth()

  if (session?.user) {
    session.user = {
      ...session.user,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image
    }
  }

  return <SessionProvider session={session}>{children}</SessionProvider>
}

export default AuthProvider
