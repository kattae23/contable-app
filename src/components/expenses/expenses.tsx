'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { DataTableDemo } from '../data-table'
import { Checkbox } from '@radix-ui/react-checkbox'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem
} from '@radix-ui/react-dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Expenses as ExpensesType,
  Categories as CategoryType,
  $Enums
} from '@prisma/client'
import {
  createExpense,
  get,
  deleteExpense as deleteExpenseById,
  updateExpense
} from '@/actions/expenses'
import { useDebounce } from 'use-debounce'
import { PaginationData } from '@/utils/interface'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { GETAll as getCategories } from '@/actions/categories'
import { User } from 'next-auth'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogClose, DialogFooter } from '../ui/dialog'
import { toast } from 'sonner'
import { capitalize } from '@/utils/capitalice'

const formSchema = z.object({
  title: z.string({
    required_error: 'Please select an title to display.'
  }),
  amount: z.preprocess(
    (a) => parseFloat(a as string),
    z.number().positive().max(100000)
  ),
  description: z.string().optional(),
  categoryId: z.string().nullable(),
  status: z
    .enum([
      $Enums.StatusEnum.PENDING,
      $Enums.StatusEnum.SUCCESS,
      $Enums.StatusEnum.FAILED
    ])
    .optional()
})

const Expenses = ({ user }: { user: User }) => {
  const [data, setData] = React.useState<ExpensesType[]>([])
  const [paginationData, setPaginationData] =
    React.useState<PaginationData | null>(null)
  const [text, setText] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [take, setTake] = useState(5)
  const [edit, setEdit] = useState(false)
  const [status, setStatus] = useState<$Enums.StatusEnum>(
    $Enums.StatusEnum.PENDING
  )
  const [expenseId, setExpenseId] = useState<string | null>(null)
  const dialogCloseRef = React.useRef<HTMLButtonElement>(null)
  const openDialogRef = React.useRef<HTMLButtonElement>(null)
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [value] = useDebounce(text, 300)

  const getExpenses = useCallback(async () => {
    const result = await get({ page, take, search: value })

    if ('error' in result) {
      console.log('error', result.error)
      return
    }

    const { data, ...rest } = result

    setData(data)
    setPaginationData(rest as PaginationData)
  }, [value, page, take])

  const fetchCategories = useCallback(async () => {
    const result = await getCategories()
    if ('error' in result) {
      console.log('error', result.error)
      toast(`Error ${result.error}`)
      return
    }
    setCategories(result)
  }, [])

  useEffect(() => {
    getExpenses()
    fetchCategories()
  }, [getExpenses, fetchCategories])

  const deleteExpense = useCallback(
    async (id: string) => {
      const result = await deleteExpenseById(id)

      if ('error' in result) {
        console.log('error', result.error)
        return
      }

      toast('Expense has been deleted.')
      getExpenses()
    },
    [getExpenses]
  )

  const columns: ColumnDef<ExpensesType>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('status')}</div>
      )
    },
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="">{row.getValue('title')}</div>
    },
    {
      accessorKey: 'description',
      header: ({ column }) => {
        return <div className="capitalize">description</div>
      },
      cell: ({ row }) => <div className="">{row.getValue('description')}</div>
    },
    {
      accessorKey: 'category',
      header: ({ column }) => {
        return <div className="capitalize">Category</div>
      },
      cell: ({ row }) => {
        const category: CategoryType = row.getValue('category')
        return <div className="">{capitalize(category.name)}</div>
      }
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'))

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount)

        return <div className="text-right font-medium">{formatted}</div>
      }
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return <div className="capitalize">date</div>
      },
      cell: ({ row }) => (
        <div className="">
          {new Date(row.getValue('createdAt')).toLocaleDateString()}
        </div>
      )
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const expense: ExpensesType & { category?: CategoryType } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setEdit(true)
                  setExpenseId(expense.id)
                  if (expense && expense.category) {
                    setValue('title', expense.title)
                    setValue(
                      'description',
                      expense?.description as string | undefined
                    )
                    setValue('amount', expense.amount)
                    setValue('categoryId', expense.category.id)
                    setValue('status', expense.status)
                    setCategory(expense?.category)
                  }
                  openDialogRef.current?.click()
                }}
              >
                Edit expense
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteExpense(expense.id)}>
                Delete expense
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(expense.id)}
              >
                Copy expense ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      amount: 0,
      description: '',
      title: '',
      categoryId: null
    },
    resolver: zodResolver(formSchema)
  })

  async function onSubmit (data: z.infer<typeof formSchema>) {
    const expenseDto = {
      ...data,
      categoryId: categoryId as string,
      userId: user.id,
      status
    }
    let newExpense
    if (edit && expenseId) {
      newExpense = await updateExpense(expenseId, expenseDto)
    } else {
      newExpense = await createExpense(expenseDto)
    }

    if (!categoryId) {
      toast('Please select a category.')
      return
    }

    if ('error' in newExpense) {
      console.log(newExpense.error)
      setExpenseId(null)
      toast(`Error: ${newExpense.error}`)
      return
    }

    if (edit) {
      toast('Expense has been updated.')
      getExpenses()
    } else {
      setData((prev) => [newExpense, ...prev])
      toast('Expense has been created.')
    }
    return dialogCloseRef.current?.click()
  }

  const handleOnOpenModal = (open: boolean) => {
    if (!open) {
      setExpenseId(null)
      setCategory(null)
      setCategoryId(null)
      setEdit(false)
      setValue('title', '')
      setValue('description', '')
      setValue('amount', 0)
      setValue('categoryId', null)
      setValue('status', $Enums.StatusEnum.PENDING)
    }
  }

  return (
    <DataTableDemo
      {...{
        openDialogRef,
        columns,
        data,
        setPage,
        setTake,
        page,
        take,
        paginationData,
        text,
        setText,
        edit,
        handleOnOpenModal
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input className="col-span-3" id="title" {...register('title')} />
          </div>
          <p>{errors.title?.message}</p>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              className="col-span-3"
              id="amount"
              type="number"
              {...register('amount')}
            />
          </div>
          <p className="ml-6">{errors.amount?.message}</p>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              className="col-span-3"
              id="description"
              {...register('description')}
            />
          </div>
          <p className="ml-6">{errors.description?.message}</p>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Status
            </Label>
            <Select
              defaultValue={$Enums.StatusEnum.SUCCESS}
              onValueChange={(value) => setStatus(value as $Enums.StatusEnum)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values($Enums.StatusEnum).map((status) => {
                  return (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <p className="ml-6">{errors.status?.message}</p>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Category
            </Label>
            <Select
              defaultValue={category?.name}
              onValueChange={(value) => setCategoryId(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
          <DialogClose ref={dialogCloseRef}></DialogClose>
        </DialogFooter>
      </form>
    </DataTableDemo>
  )
}

export default Expenses
