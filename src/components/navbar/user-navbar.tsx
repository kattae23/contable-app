'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useSession, signOut } from 'next-auth/react'
import { Icons } from '../icons-shad-cn'
import clsx from 'clsx'

export function UserNav () {
  const { data: session, status } = useSession()
  if (status === 'unauthenticated') {
    return <Icons.spinner className="animate-spin w-10 h-10 text-blue-600" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session?.user?.image || '/user-default.jpg'}
              alt={'profile pic'}
            />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name}
              {session?.user?.lastName}
            </p>
            <p
              className={clsx(
                'text-xs leading-none',
                session?.user?.role === 'admin'
                  ? 'text-gray-800 uppercase'
                  : 'text-muted-foreground'
              )}
            >
              {session?.user?.role}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
