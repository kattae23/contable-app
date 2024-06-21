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
import { User } from '@prisma/client'
import { get } from '@/actions/payments'
import { Input } from '../ui/input'
import { useDebounce } from 'use-debounce'
import { PaginationData, TransactionWithCustomer } from '@/utils/interface'

const Payments = () => {
  const [data, setData] = React.useState<TransactionWithCustomer[]>([])
  const [paginationData, setPaginationData] =
    React.useState<PaginationData | null>(null)
  const [text, setText] = useState('')
  const [page, setPage] = useState(1)
  const [take, setTake] = useState(5)
  const [value] = useDebounce(text, 300)

  const getPayments = useCallback(async () => {
    const result = await get({ page, take, search: value })

    if ('error' in result) {
      console.log('error', result.error)
      return
    }

    const { data, ...rest } = result

    setData(data)
    setPaginationData(rest as PaginationData)
  }, [value, page, take])

  useEffect(() => {
    getPayments()
  }, [getPayments])

  const columns: ColumnDef<TransactionWithCustomer>[] = [
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
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue('title')}</div>
      )
    },
    {
      accessorKey: 'description',
      header: ({ column }) => {
        return <div className="capitalize">description</div>
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue('description')}</div>
      )
    },
    {
      accessorKey: 'customer',
      header: ({ column }) => {
        return <div className="capitalize">Customer</div>
      },
      cell: ({ row }) => {
        const customer: User & {
          lastname?: string
        } = row.getValue('customer')
        return (
          <div className="lowercase">
            {customer?.name} {customer?.lastname}
          </div>
        )
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
        <div className="lowercase">
          {new Date(row.getValue('createdAt')).toLocaleDateString()}
        </div>
      )
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original

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
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy payment ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <DataTableDemo
      columns={columns}
      data={data}
      setPage={setPage}
      setTake={setTake}
      page={page}
      take={take}
      paginationData={paginationData}
    >
      <Input
        placeholder="Search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="max-w-sm"
      />
    </DataTableDemo>
  )
}

export default Payments
