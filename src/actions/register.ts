'use server'

import * as z from 'zod'
import bcrypt from 'bcryptjs'

import { RegisterSchema } from '@/schemas'
import prisma from '@/lib/prisma'
import { getUserByEmail } from '@/data/user'

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Invalid fields.' }
  }

  const { password, ...userWithoutPass } = validatedFields.data
  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await getUserByEmail(userWithoutPass.email)

  if (existingUser) {
    return { error: 'User email already exists.' }
  }

  await prisma.user.create({
    data: {
      ...userWithoutPass,
      password: hashedPassword
    }
  })

  return { success: 'Successfully registered.' }
}
