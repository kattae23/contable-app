import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import React from 'react'

export function DialogModal ({
  children,
  name,
  edit = false,
  openDialogRef,
  handleOnOpenModal
}: {
  children: React.ReactNode
  name: string
  edit?: boolean
  openDialogRef?: React.RefObject<HTMLButtonElement>
  handleOnOpenModal: (open: boolean) => void
}) {
  return (
    <Dialog onOpenChange={handleOnOpenModal}>
      <DialogTrigger asChild>
        <Button ref={openDialogRef} variant="outline" className="mr-3">
          Add {name} <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {edit ? 'Edit' : 'Add'} {name}
          </DialogTitle>
          <DialogDescription>
            {edit ? 'Edit' : 'Create'} your {name} here. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
