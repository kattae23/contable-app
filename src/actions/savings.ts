'use server'

import { currentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { SavingSchema } from '@/schemas'
import { getSkip, paginateResponse } from '@/utils/functions'
import { CreateSavingDto, PaginationDto } from '@/utils/interface'
import { Savings } from '@prisma/client'

export const GET = async (paginationDto: PaginationDto) => {
  const user = await currentUser()
  const { search, page = 1, take = 25 } = paginationDto

  const skip = getSkip(take, page)

  const term = search as any
  try {
    const savings = (await prisma.savings.findMany({
      where: {
        user: {
          id: user?.id
        },
        OR: [
          {
            title: { contains: term, mode: 'insensitive' }
          },
          { description: { contains: term, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take,
      skip
    })) as Savings[]

    const total = await prisma.savings.count({
      where: {
        user: {
          id: user?.id
        },
        OR: [
          {
            title: { contains: term, mode: 'insensitive' }
          },
          { description: { contains: term, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return paginateResponse(page, take, total, savings)
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const createSaving = async (createSavingDto: CreateSavingDto) => {
  try {
    const validatedFields = SavingSchema.safeParse(createSavingDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const { amount, title, userId, description } = validatedFields.data

    const newSaving = await prisma.savings.create({
      data: {
        title,
        description,
        userId,
        amount
      }
    })

    return newSaving
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const updateSaving = async (
  savingId: string,
  createSavingDto: CreateSavingDto
) => {
  try {
    const validatedFields = SavingSchema.safeParse(createSavingDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const { amount, title, userId, description } = validatedFields.data

    const newSaving = await prisma.savings.update({
      where: {
        id: savingId
      },
      data: {
        title,
        description,
        userId,
        amount
      }
    })

    return newSaving
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const deleteSaving = async (savingId: string) => {
  try {
    const saving = await prisma.savings.findUnique({
      where: {
        id: savingId
      }
    })

    if (!saving) {
      return { error: 'Saving not found' }
    }

    await prisma.savings.delete({
      where: {
        id: savingId
      }
    })

    return { success: true }
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}
