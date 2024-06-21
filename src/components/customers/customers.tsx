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
  Customers as CustomersType,
  Customers as CustomerType
} from '@prisma/client'
import { useDebounce } from 'use-debounce'
import { PaginationData } from '@/utils/interface'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import {
  createCustomer,
  deleteCustomer as deleteCustomerById,
  GET,
  updateCustomer
} from '@/actions/customers'
import { User } from 'next-auth'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogClose, DialogFooter } from '../ui/dialog'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string({
    required_error: 'Please select an name to display.'
  }),
  lastname: z.string({
    required_error: 'Please select an name to display.'
  }),
  email: z
    .string({
      required_error: 'Please select an name to display.'
    })
    .email('This is not a valid email.')
})

const Customers = ({ user }: { user: User }) => {
  const [data, setData] = React.useState<CustomersType[]>([])
  const [paginationData, setPaginationData] =
    React.useState<PaginationData | null>(null)
  const [text, setText] = useState('')
  const [page, setPage] = useState(1)
  const [take, setTake] = useState(5)
  const [edit, setEdit] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const dialogCloseRef = React.useRef<HTMLButtonElement>(null)
  const openDialogRef = React.useRef<HTMLButtonElement>(null)
  const [value] = useDebounce(text, 300)

  const getCustomerList = useCallback(async () => {
    const result = await GET({ page, take, search: value })

    if ('error' in result) {
      console.log('error', result.error)
      return
    }

    const { data, ...rest } = result

    setData(data)
    setPaginationData(rest as PaginationData)
  }, [value, page, take])

  useEffect(() => {
    getCustomerList()
  }, [getCustomerList])

  const deleteCustomer = useCallback(
    async (id: string) => {
      const result = await deleteCustomerById(id)

      if ('error' in result) {
        console.log('error', result.error)
        return
      }

      toast('Customer has been deleted.')
      getCustomerList()
    },
    [getCustomerList]
  )

  const columns: ColumnDef<CustomersType>[] = [
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
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="">{row.getValue('name')}</div>
    },
    {
      accessorKey: 'lastname',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Lastname
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="">{row.getValue('lastname')}</div>
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="">{row.getValue('email')}</div>
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
        const customer: CustomersType & { customer?: CustomerType } =
          row.original

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
                  setCustomerId(customer.id)
                  if (customer) {
                    setValue('name', customer.name)
                    setValue('lastname', customer.lastname as string)
                    setValue('email', customer.email as string)
                  }
                  openDialogRef.current?.click()
                }}
              >
                Edit customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteCustomer(customer.id)}>
                Delete customer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(customer.id)}
              >
                Copy customer ID
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
      name: ''
    },
    resolver: zodResolver(formSchema)
  })

  async function onSubmit (data: z.infer<typeof formSchema>) {
    const customerDto = { ...data, userId: user.id }
    let newCustomer
    if (edit && customerId) {
      newCustomer = await updateCustomer(customerId, customerDto)
    } else {
      newCustomer = await createCustomer(customerDto)
    }

    if ('error' in newCustomer) {
      console.log(newCustomer.error)
      setCustomerId(null)
      toast(`Error: ${newCustomer.error}`)
      return
    }

    if (edit) {
      toast('Customer has been updated.')
      getCustomerList()
    } else {
      setData((prev) => [newCustomer, ...prev])
      toast('Customer has been created.')
    }
    return dialogCloseRef.current?.click()
  }

  const handleOnOpenModal = (open: boolean) => {
    if (!open) {
      setEdit(false)
      setValue('name', '')
      setValue('lastname', '')
      setValue('email', '')
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
              Name
            </Label>
            <Input className="col-span-3" id="name" {...register('name')} />
          </div>
          <p className="ml-6">{errors.name?.message}</p>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastname" className="text-right">
              Lastname
            </Label>
            <Input
              className="col-span-3"
              id="lastname"
              {...register('lastname')}
            />
          </div>
          <p className="ml-6">{errors.name?.message}</p>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input className="col-span-3" id="email" {...register('email')} />
          </div>
          <p className="ml-6">{errors.name?.message}</p>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
          <DialogClose ref={dialogCloseRef}></DialogClose>
        </DialogFooter>
      </form>
    </DataTableDemo>
  )
}

export default Customers
