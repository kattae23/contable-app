'use server'

import { currentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PaymentSchema } from '@/schemas'
import { getSkip, paginateResponse } from '@/utils/functions'
import { CreatePaymentDto, PaginationDto } from '@/utils/interface'
import { Transactions } from '@prisma/client'

export const get = async (paginationDto: PaginationDto) => {
  const user = await currentUser()
  const { search, page = 1, take = 25 } = paginationDto

  const skip = getSkip(take, page)

  const term = search as any

  try {
    const payments = (await prisma.transactions.findMany({
      where: {
        user: {
          id: user?.id
        },
        OR: [
          {
            title: { contains: term, mode: 'insensitive' }
          },
          {
            customer: {
              OR: [
                {
                  name: { contains: term, mode: 'insensitive' }
                },
                {
                  lastname: { contains: term, mode: 'insensitive' }
                }
              ]
            }
          },
          { description: { contains: term, mode: 'insensitive' } }
        ]
      },
      include: {
        customer: true,
        category: true
      },
      orderBy: {
        createdAt: 'asc'
      },
      take,
      skip
    })) as Transactions[]

    const total = await prisma.transactions.count({
      where: {
        user: {
          id: user?.id
        },
        OR: [
          {
            title: { contains: term, mode: 'insensitive' }
          },
          {
            customer: {
              OR: [
                {
                  name: { contains: term, mode: 'insensitive' }
                },
                {
                  lastname: { contains: term, mode: 'insensitive' }
                }
              ]
            }
          },
          { description: { contains: term, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return paginateResponse(page, take, total, payments)
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const createPayment = async (createPaymentDto: CreatePaymentDto) => {
  try {
    const validatedFields = PaymentSchema.safeParse(createPaymentDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const {
      amount,
      categoryId,
      title,
      userId,
      status,
      description,
      customerId
    } = validatedFields.data

    const newPayment = await prisma.transactions.create({
      data: {
        title,
        userId,
        categoryId: categoryId as string,
        amount,
        status,
        customerId,
        description
      },
      include: {
        customer: true,
        category: true
      }
    })

    return newPayment
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const updatePayment = async (
  expenseId: string,
  createPaymentDto: CreatePaymentDto
) => {
  try {
    const validatedFields = PaymentSchema.safeParse(createPaymentDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const {
      amount,
      categoryId,
      title,
      userId,
      status,
      description,
      customerId
    } = validatedFields.data

    const newPayment = await prisma.transactions.update({
      where: {
        id: expenseId
      },
      data: {
        title,
        description,
        userId,
        categoryId: categoryId as string,
        amount,
        status,
        customerId
      },
      include: {
        customer: true,
        category: true
      }
    })

    return newPayment
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const deletePayment = async (expenseId: string) => {
  try {
    const expense = await prisma.transactions.findUnique({
      where: {
        id: expenseId
      }
    })

    if (!expense) {
      return { error: 'Payment not found' }
    }

    await prisma.transactions.delete({
      where: {
        id: expenseId
      }
    })

    return { success: true }
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}
