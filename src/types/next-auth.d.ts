/* eslint-disable no-unused-vars */
import { User, UserRole } from '@prisma/client'
import { DefaultSession } from 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      role: UserRole
      id: string
      email: string
      accessToken: string
    } & User
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    role: UserRole
    id: string
  }
}
