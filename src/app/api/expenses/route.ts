import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const GET = auth(async function GET (req) {
  if (!req.auth) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  const expenses = await prisma.expenses.findMany({
    where: {
      user: {
        id: req.auth?.user.id
      }
    }
  })

  return NextResponse.json(expenses)
})

export async function POST (request: Request) {}

export async function DELETE (request: Request) {}

export async function PATCH (request: Request) {}
