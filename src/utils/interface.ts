import {
  Categories,
  Customers,
  Expenses,
  Savings,
  Transactions,
  User
} from '@prisma/client'
import { JSX } from 'react'

export interface LinkProps {
  label: string
  href: string
  icon: JSX.Element
}

export interface PaginationDto {
  search?: string
  page?: number
  take?: number
}

export interface CreateExpenseDto extends Partial<Expenses> {}

export interface CreateSavingDto extends Partial<Savings> {}

export interface CreateCustomerDto extends Partial<Customers> {}

export interface CreatePaymentDto extends Partial<Transactions> {}

export interface CreateCategoryDto extends Partial<Categories> {}

export interface TransactionWithCustomer extends Transactions {
  customer?: User
}

export interface PaginationData {
  total: number
  currentPage: number
  nextPage: number | null
  prevPage: number | null
  lastPage: number
}
