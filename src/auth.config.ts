import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'
import { LoginSchema } from './schemas'
import { getUserByEmail } from './data/user'
import bcrypt from 'bcryptjs'

export default {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'email', placeholder: 'test@test.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize (credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await getUserByEmail(email)

          if (!user || !user.password) return null

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) return user
        }

        return null
      }
    }),
    GitHub({
      async profile (profile) {
        console.log(profile)
        return {
          id: profile.node_id,
          name: `${profile.name}`,
          legalName: '',
          lastName: '',
          secondLastName: '',
          email: profile.email,
          image: profile.avatar_url,
          role:
            process.env.NODE_ENV === 'production'
              ? profile.role ?? 'user'
              : profile.role ?? 'admin'
        }
      }
    }),
    Google({
      async profile (profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name}`,
          legalName: `${profile.given_name}`,
          lastName: `${
            profile.family_name ? profile.family_name.split(' ')[0] : ''
          }`,
          secondLastName: `${profile.family_name ? profile.family_name.split(' ')[1] : ''}`,
          email: profile.email,
          image: profile.picture,
          role:
            process.env.NODE_ENV === 'production'
              ? profile.role ?? 'user'
              : profile.role ?? 'admin'
        }
      }
    })
  ]
} satisfies NextAuthConfig
