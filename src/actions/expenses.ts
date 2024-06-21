'use server'

import { currentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ExpenseSchema } from '@/schemas'
import { getSkip, paginateResponse } from '@/utils/functions'
import { CreateExpenseDto, PaginationDto } from '@/utils/interface'
import { Expenses } from '@prisma/client'

export const get = async (paginationDto: PaginationDto) => {
  const user = await currentUser()
  const { search, page = 1, take = 25 } = paginationDto

  const skip = getSkip(take, page)

  const term = search as any
  try {
    const expenses = (await prisma.expenses.findMany({
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
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take,
      skip
    })) as Expenses[]

    const total = await prisma.expenses.count({
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

    return paginateResponse(page, take, total, expenses)
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const createExpense = async (createExpenseDto: CreateExpenseDto) => {
  try {
    const validatedFields = ExpenseSchema.safeParse(createExpenseDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const { amount, categoryId, title, userId, description, status } =
      validatedFields.data

    const newExpense = await prisma.expenses.create({
      data: {
        title,
        description,
        userId,
        categoryId: categoryId as string,
        amount,
        status
      },
      include: {
        category: true
      }
    })

    return newExpense
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const updateExpense = async (
  expenseId: string,
  createExpenseDto: CreateExpenseDto
) => {
  try {
    const validatedFields = ExpenseSchema.safeParse(createExpenseDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const { amount, categoryId, title, userId, description, status } =
      validatedFields.data

    const newExpense = await prisma.expenses.update({
      where: {
        id: expenseId
      },
      data: {
        title,
        description,
        userId,
        categoryId: categoryId as string,
        amount,
        status
      },
      include: {
        category: true
      }
    })

    return newExpense
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const deleteExpense = async (expenseId: string) => {
  try {
    const expense = await prisma.expenses.findUnique({
      where: {
        id: expenseId
      }
    })

    if (!expense) {
      return { error: 'Expense not found' }
    }

    await prisma.expenses.delete({
      where: {
        id: expenseId
      }
    })

    return { success: true }
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}
