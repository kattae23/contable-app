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
import { Savings as SavingsType, Savings as SavingType } from '@prisma/client'
import { useDebounce } from 'use-debounce'
import { PaginationData } from '@/utils/interface'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import {
  createSaving,
  deleteSaving as deleteSavingById,
  GET,
  updateSaving
} from '@/actions/savings'
import { User } from 'next-auth'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogClose, DialogFooter } from '../ui/dialog'
import { toast } from 'sonner'

const formSchema = z.object({
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

const Savings = ({ user }: { user: User }) => {
  const [data, setData] = React.useState<SavingsType[]>([])
  const [paginationData, setPaginationData] =
    React.useState<PaginationData | null>(null)
  const [text, setText] = useState('')
  const [page, setPage] = useState(1)
  const [take, setTake] = useState(5)
  const [edit, setEdit] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const dialogCloseRef = React.useRef<HTMLButtonElement>(null)
  const openDialogRef = React.useRef<HTMLButtonElement>(null)
  const [value] = useDebounce(text, 300)

  const getSavingList = useCallback(async () => {
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
    getSavingList()
  }, [getSavingList])

  const deleteSaving = useCallback(
    async (id: string) => {
      const result = await deleteSavingById(id)

      if ('error' in result) {
        console.log('error', result.error)
        return
      }

      toast('Saving has been deleted.')
      getSavingList()
    },
    [getSavingList]
  )

  const columns: ColumnDef<SavingsType>[] = [
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
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="">{row.getValue('description')}</div>
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="">{row.getValue('amount')}</div>
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
        const saving: SavingsType & { saving?: SavingType } = row.original

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
                  setSavingId(saving.id)
                  if (saving && saving.saving) {
                    setValue('title', saving.title)
                    setValue('amount', saving.amount)
                    setValue('description', saving.description as string)
                  }
                  openDialogRef.current?.click()
                }}
              >
                Edit saving
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteSaving(saving.id)}>
                Delete saving
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(saving.id)}
              >
                Copy saving ID
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
      title: '',
      amount: 0,
      description: '',
      userId: user.id
    },
    resolver: zodResolver(formSchema)
  })

  async function onSubmit (data: z.infer<typeof formSchema>) {
    const savingDto = { ...data, userId: user.id }
    let newSaving
    if (edit && savingId) {
      newSaving = await updateSaving(savingId, savingDto)
    } else {
      newSaving = await createSaving(savingDto)
    }

    if ('error' in newSaving) {
      console.log(newSaving.error)
      setSavingId(null)
      toast(`Error: ${newSaving.error}`)
      return
    }

    if (edit) {
      toast('Saving has been updated.')
      getSavingList()
    } else {
      setData((prev) => [newSaving, ...prev])
      toast('Saving has been created.')
    }
    return dialogCloseRef.current?.click()
  }

  const handleOnOpenModal = (open: boolean) => {
    if (!open) {
      setSavingId(null)
      setEdit(false)
      setValue('title', '')
      setValue('amount', 0)
      setValue('description', '')
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
          <p className="ml-6">{errors.title?.message}</p>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input className="col-span-3" id="amount" {...register('amount')} />
          </div>
          <p className="ml-6">{errors.amount?.message}</p>
        </div>
        <div className="grid gap-4 py-4">
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
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
          <DialogClose ref={dialogCloseRef}></DialogClose>
        </DialogFooter>
      </form>
    </DataTableDemo>
  )
}

export default Savings
