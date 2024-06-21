import prisma from '@/lib/prisma'
import { RegisterSchema } from '@/schemas'
import * as bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST (request: Request) {
  try {
    const body = await request.json()

    const response = RegisterSchema.safeParse(body)

    if (!response.success) {
      const { errors } = response.error

      return new NextResponse(
        JSON.stringify({ msg: 'Invalid request', errors }),
        { status: 400 }
      )
    }

    const userExist = await prisma.user.findFirst({
      where: {
        email: response.data.email
      }
    })

    if (userExist) {
      return Response.json({ msg: 'Email ya registrado.' }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        ...response.data,
        password: await bcrypt.hash(response.data.password, 10)
      }
    })

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

    await prisma.savings.create({
      data: {
        user: {
          connect: {
            id: user.id
          }
        },
        title: 'Ahorro Inicial',
        amount: 0,
        description: 'Ahorro Inicial'
      }
    })

    const { password, ...userWithoutPass } = user

    const result = {
      ...userWithoutPass
    }

    return Response.json(result, { status: 201 })
  } catch (error) {
    console.log(error)
    return Response.json({ msg: 'an error occurred' }, { status: 500 })
  }
}
