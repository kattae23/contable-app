import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { Plus } from 'lucide-react'
import React from 'react'

export function SideModal ({
  children,
  name,
  adding = false
}: {
  children: React.ReactNode
  name: string
  adding?: boolean
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="mr-3">
          {adding ? 'Add' : 'Edit'} {name} <Plus className="ml-2 h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {adding ? 'Add' : 'Edit'} {name}
          </SheetTitle>
          <SheetDescription>
            Create your {name} here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
