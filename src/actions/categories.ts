'use server'

import { currentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { CategorySchema } from '@/schemas'
import { getSkip, paginateResponse } from '@/utils/functions'
import {
  CreateCategoryDto,
  CreateExpenseDto,
  PaginationDto
} from '@/utils/interface'
import { Categories } from '@prisma/client'

export const GET = async (paginationDto: PaginationDto) => {
  const user = await currentUser()
  const { search, page = 1, take = 25 } = paginationDto

  const skip = getSkip(take, page)

  const term = search as any
  try {
    const categories = (await prisma.categories.findMany({
      where: {
        user: {
          id: user?.id
        },
        OR: [
          {
            name: { contains: term, mode: 'insensitive' }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take,
      skip
    })) as Categories[]

    const total = await prisma.categories.count({
      where: {
        user: {
          id: user?.id
        },
        OR: [
          {
            name: { contains: term, mode: 'insensitive' }
          }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return paginateResponse(page, take, total, categories)
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const GETAll = async () => {
  const user = await currentUser()
  try {
    return await prisma.categories.findMany({
      where: {
        userId: user?.id
      }
    })
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const GETOne = async (id: string) => {
  const user = await currentUser()

  try {
    return await prisma.categories.findUnique({
      where: {
        id,
        userId: user?.id
      }
    })
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const createCategory = async (createCategoryDto: CreateCategoryDto) => {
  try {
    const validatedFields = CategorySchema.safeParse(createCategoryDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const { name, userId } = validatedFields.data

    const newCategory = await prisma.categories.create({
      data: {
        userId,
        name
      }
    })

    return newCategory
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const updateCategory = async (
  categoryId: string,
  updateCategoryDto: CreateExpenseDto
) => {
  try {
    const validatedFields = CategorySchema.safeParse(updateCategoryDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const { name, userId } = validatedFields.data

    const newCategory = await prisma.categories.update({
      where: {
        id: categoryId
      },
      data: {
        userId,
        name
      }
    })

    return newCategory
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const deleteCategory = async (categoryId: string) => {
  try {
    const category = await prisma.categories.findUnique({
      where: {
        id: categoryId
      }
    })

    if (!category) {
      return { error: 'Expense not found' }
    }

    await prisma.categories.delete({
      where: {
        id: category.id
      }
    })

    return { success: true }
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}
