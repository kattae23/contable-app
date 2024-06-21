import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'
import authconfig from './auth.config'
import { getAccountByUserId } from './data/account'
import { getUserById } from './data/user'

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/auth/login'
  },
  events: {
    async linkAccount ({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    },
    async createUser ({ user }) {
      await prisma.balance.create({
        data: {
          user: {
            connect: {
              id: user.id
            }
          },
          amount: 0
        }
      })
    }
  },
  callbacks: {
    async signIn ({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true

      const existingUser = await getUserById(user.id as string)

      // Prevent sign in without email verification
      if (existingUser) return true

      return false
    },
    async session ({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role
      }

      if (session.user) {
        session.user.name = token.name as string
        session.user.email = token.email as string
      }

      return session
    },
    async jwt ({ token }) {
      if (!token.sub) return token

      const existingUser = await getUserById(token.sub)

      if (!existingUser) return token

      const existingAccount = await getAccountByUserId(existingUser.id)

      token.isOAuth = !!existingAccount
      token.name = existingUser.name
      token.email = existingUser.email
      token.role = existingUser.role

      return token
    }
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authconfig
})
