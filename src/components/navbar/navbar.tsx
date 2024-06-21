'use client'
import { Input } from '@/components/ui/input'
import { UserNav } from './user-navbar'
import { Menu } from 'lucide-react'
import { navbarStore } from '@/store/navbar.store'
import clsx from 'clsx'

const Navbar = () => {
  const { setOpen, open } = navbarStore()
  return (
    <header
      className={clsx(
        ' h-16 absolute top-0 left-0 bg-white flex z-10 items-center',
        open
          ? 'ml-64 md:w-[calc(100%-256px)]'
          : 'ml-0 md:ml-20 md:w-[calc(100%-80px)]'
      )}
    >
      <Menu
        onClick={setOpen}
        className="w-10 ml-7 text-bgPrimary cursor-pointer"
      />
      <div className="w-full h-full flex justify-between items-center px-7">
        <Input
          placeholder="Search"
          className="inline-block max-w-52 h-10 rounded-full border-2 border-slate-200 focus-visible:ring-0"
        />
        <div className="flex space-x-4 ml-10">
          <UserNav />
        </div>
      </div>
    </header>
  )
}

export default Navbar
