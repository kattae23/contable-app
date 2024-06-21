'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { FaCircleArrowLeft, FaCircleArrowRight } from 'react-icons/fa6'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { usePathname } from 'next/navigation'
import { capitalize } from '@/utils/capitalice'
import { PaginationData } from '@/utils/interface'
import { Input } from './ui/input'
import { DialogModal } from './dialog-modal'

interface DataTableDemoProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  children?: React.ReactNode
  setPage: React.Dispatch<React.SetStateAction<number>>
  setTake: React.Dispatch<React.SetStateAction<number>>
  page: number
  take: number
  paginationData: PaginationData | null
  text: string
  setText: React.Dispatch<React.SetStateAction<string>>
  edit: boolean
  openDialogRef?: React.RefObject<HTMLButtonElement>
  handleOnOpenModal: (open: boolean) => void
}

export function DataTableDemo<T> ({
  data,
  columns,
  children,
  setPage,
  setTake,
  page,
  take,
  paginationData,
  text,
  setText,
  edit,
  openDialogRef,
  handleOnOpenModal
}: DataTableDemoProps<T>) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter((item) => item !== '')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4 justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="md:mx-4 font-bold text-zinc-600">
            {capitalize(segments[0])}
          </h1>
          <Input
            placeholder="Search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div>
          <DialogModal
            handleOnOpenModal={handleOnOpenModal}
            openDialogRef={openDialogRef}
            name={capitalize(segments[0])}
            edit={edit}
          >
            {children}
          </DialogModal>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value: any) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border min-h-[calc(100vh-300px)] max-h-[calc(100vh-281px)] overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="max-h-36">
            {table.getRowModel().rows?.length
              ? (
                  table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                  ))
                )
              : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
                )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${take}`}
            onValueChange={(value) => {
              setTake(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {paginationData?.currentPage!} of {paginationData?.lastPage}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPage(1)}
            disabled={paginationData?.currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <FaCircleArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage(page - 1)}
            disabled={!paginationData?.prevPage}
          >
            <span className="sr-only">Go to previous page</span>
            <FaCircleArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage(page + 1)}
            disabled={!paginationData?.nextPage}
          >
            <span className="sr-only">Go to next page</span>
            <FaCircleArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPage(paginationData?.lastPage as number)}
            disabled={!paginationData?.nextPage}
          >
            <span className="sr-only">Go to last page</span>
            <FaCircleArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
