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
  Categories as CategoriesType,
  Categories as CategoryType
} from '@prisma/client'
import { useDebounce } from 'use-debounce'
import { PaginationData } from '@/utils/interface'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import {
  createCategory,
  deleteCategory as deleteCategoryById,
  GET,
  updateCategory
} from '@/actions/categories'
import { User } from 'next-auth'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogClose, DialogFooter } from '../ui/dialog'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string({
    required_error: 'Please select an name to display.'
  })
})

const Categories = ({ user }: { user: User }) => {
  const [data, setData] = React.useState<CategoriesType[]>([])
  const [paginationData, setPaginationData] =
    React.useState<PaginationData | null>(null)
  const [text, setText] = useState('')
  const [page, setPage] = useState(1)
  const [take, setTake] = useState(5)
  const [edit, setEdit] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const dialogCloseRef = React.useRef<HTMLButtonElement>(null)
  const openDialogRef = React.useRef<HTMLButtonElement>(null)
  const [value] = useDebounce(text, 300)

  const getCategoryList = useCallback(async () => {
    const result = await GET({ page, take, search: value })

    if ('error' in result) {
      console.log('error', result.error)
      return
    }

    const { data, ...rest } = result

    setData(data)
    setPaginationData(rest as PaginationData)
  }, [value, page, take])

  // const fetchCategories = useCallback(async () => {
  //   const data = await getCategories(user.id as string)
  //   setCategories(data)
  // }, [user.id])

  useEffect(() => {
    getCategoryList()
    // fetchCategories()
  }, [
    getCategoryList
    //  fetchCategories
  ])

  const deleteCategory = useCallback(
    async (id: string) => {
      const result = await deleteCategoryById(id)

      if ('error' in result) {
        console.log('error', result.error)
        return
      }

      toast('Category has been deleted.')
      getCategoryList()
    },
    [getCategoryList]
  )

  const columns: ColumnDef<CategoriesType>[] = [
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
            name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="">{row.getValue('name')}</div>
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
        const category: CategoriesType & { category?: CategoryType } =
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
                  setCategoryId(category.id)
                  if (category && category.category) {
                    setValue('name', category.name)
                  }
                  openDialogRef.current?.click()
                }}
              >
                Edit category
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteCategory(category.id)}>
                Delete category
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(category.id)}
              >
                Copy category ID
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
    const categoryDto = { ...data, userId: user.id }
    let newCategory
    if (edit && categoryId) {
      newCategory = await updateCategory(categoryId, categoryDto)
    } else {
      newCategory = await createCategory(categoryDto)
    }

    if ('error' in newCategory) {
      console.log(newCategory.error)
      setCategoryId(null)
      toast(`Error: ${newCategory.error}`)
      return
    }

    if (edit) {
      toast('Category has been updated.')
      getCategoryList()
    } else {
      setData((prev) => [newCategory, ...prev])
      toast('Category has been created.')
    }
    return dialogCloseRef.current?.click()
  }

  const handleOnOpenModal = (open: boolean) => {
    if (!open) {
      setCategoryId(null)
      setEdit(false)
      setValue('name', '')
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
            <Input className="col-span-3" id="title" {...register('name')} />
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

export default Categories
