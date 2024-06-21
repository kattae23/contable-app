import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const GET = auth(async function GET (req) {
  if (!req.auth) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  const balance = await prisma.balance.findFirst({
    where: {
      user: {
        id: req.auth?.user.id
      }
    }
  })

  return NextResponse.json(balance)
})

export async function PATCH (request: Request) {}
