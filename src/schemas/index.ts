import { $Enums } from '@prisma/client'
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z
    .string()
    .min(2, {
      message: 'email must be at least 10 characters.'
    })
    .email('This is not a valid email.'),
  password: z
    .string()
    .min(8, {
      message: 'password must be at least 8 characters.'
    })
    .max(16, {
      message: 'password must be at max 16 characters'
    })
})

export const RegisterSchema = z.object({
  name: z.string().min(3, { message: 'name must be more than 3 characters' }),
  lastName: z
    .string()
    .min(3, { message: 'lastName must be more than 3 characters' }),
  secondLastName: z
    .string()
    .min(3, { message: 'secondLastName must be more than 3 characters' }),
  nacionality: z.string(),
  phone: z.string().min(3, { message: 'phone must be more than 3 characters' }),
  email: z
    .string()
    .min(2, {
      message: 'email must be at least 10 characters.'
    })
    .email('This is not a valid email.'),
  password: z
    .string()
    .min(8, {
      message: 'password must be at least 8 characters.'
    })
    .max(16, {
      message: 'password must be at max 16 characters'
    })
})

export const ExpenseSchema = z.object({
  title: z.string({
    required_error: 'Please select an title to display.'
  }),
  amount: z.preprocess(
    (a) => parseFloat(a as string),
    z.number().positive().max(100000)
  ),
  description: z.string().optional(),
  categoryId: z.string(),
  userId: z.string(),
  status: z.enum([
    $Enums.StatusEnum.PENDING,
    $Enums.StatusEnum.SUCCESS,
    $Enums.StatusEnum.FAILED
  ])
})

export const PaymentSchema = z.object({
  title: z.string({
    required_error: 'Please select an title to display.'
  }),
  amount: z.preprocess(
    (a) => parseFloat(a as string),
    z.number().positive().max(100000)
  ),
  description: z.string().optional(),
  categoryId: z.string(),
  customerId: z.string(),
  userId: z.string(),
  status: z.enum([
    $Enums.StatusEnum.PENDING,
    $Enums.StatusEnum.SUCCESS,
    $Enums.StatusEnum.FAILED
  ])
})

export const CategorySchema = z.object({
  name: z.string({
    required_error: 'Please select an name to display.'
  }),
  userId: z.string()
})

export const CustomerSchema = z.object({
  name: z.string().min(3, { message: 'name must be more than 3 characters' }),
  lastname: z.string().optional(),
  email: z
    .string()
    .min(2, {
      message: 'email must be at least 10 characters.'
    })
    .email('This is not a valid email.')
    .optional(),
  userId: z.string().uuid()
})

export const SavingSchema = z.object({
  title: z.string({
    required_error: 'Please select an title to display.'
  }),
  amount: z.preprocess(
    (a) => parseFloat(a as string),
    z.number().positive().max(100000)
  ),
  description: z.string().optional(),
  userId: z.string()
})
