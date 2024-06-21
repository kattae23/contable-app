'use server'

import { currentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { CustomerSchema } from '@/schemas'
import { getSkip, paginateResponse } from '@/utils/functions'
import { CreateCustomerDto, PaginationDto } from '@/utils/interface'
import { Customers } from '@prisma/client'

export const GET = async (paginationDto: PaginationDto) => {
  const user = await currentUser()
  const { search, page = 1, take = 25 } = paginationDto

  const skip = getSkip(take, page)

  const term = search as any
  try {
    const customers = (await prisma.customers.findMany({
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
    })) as Customers[]

    const total = await prisma.customers.count({
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

    return paginateResponse(page, take, total, customers)
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const GETAll = async () => {
  const user = await currentUser()
  try {
    return await prisma.customers.findMany({
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
    return await prisma.customers.findUnique({
      where: {
        id,
        userId: user?.id
      }
    })
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const createCustomer = async (createCustomerDto: CreateCustomerDto) => {
  try {
    const validatedFields = CustomerSchema.safeParse(createCustomerDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const customerDto = validatedFields.data

    const newCustomer = await prisma.customers.create({
      data: {
        ...customerDto
      }
    })

    return newCustomer
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const updateCustomer = async (
  customerId: string,
  updateCustomerDto: CreateCustomerDto
) => {
  try {
    const validatedFields = CustomerSchema.safeParse(updateCustomerDto)

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const customerDto = validatedFields.data

    const newCustomer = await prisma.customers.update({
      where: {
        id: customerId
      },
      data: {
        ...customerDto
      }
    })

    return newCustomer
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}

export const deleteCustomer = async (customerId: string) => {
  try {
    const customer = await prisma.customers.findUnique({
      where: {
        id: customerId
      }
    })

    if (!customer) {
      return { error: 'Customer not found' }
    }

    await prisma.customers.delete({
      where: {
        id: customer.id
      }
    })

    return { success: true }
  } catch (error) {
    return { error: 'An error ocurred' }
  }
}
