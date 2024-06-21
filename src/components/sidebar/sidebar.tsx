'use client'
import { FaHouseChimney, FaPersonRays } from 'react-icons/fa6'
import { GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { TbPigMoney } from 'react-icons/tb'

import Link from 'next/link'
import { LinkProps } from '@/utils/interface'
import { navbarStore } from '@/store/navbar.store'
import clsx from 'clsx'
import Image from 'next/image'
import { SidebarCloseIcon } from 'lucide-react'
import { MdCategory } from 'react-icons/md'

const links: LinkProps[] = [
  {
    label: 'Inicio',
    href: '/',
    icon: <FaHouseChimney />
  },
  {
    label: 'Gastos',
    href: '/expenses',
    icon: <GiPayMoney />
  },
  {
    label: 'Pagos',
    href: '/payments',
    icon: <GiReceiveMoney />
  },
  {
    label: 'Categorias',
    href: '/categories',
    icon: <MdCategory />
  },
  {
    label: 'Clientes',
    href: '/customers',
    icon: <FaPersonRays />
  },
  {
    label: 'Ahorros',
    href: '/savings',
    icon: <TbPigMoney />
  }
]

const Sidebar = () => {
  const { open, setOpen } = navbarStore()
  return (
    <aside
      className={clsx(
        'md:flex flex-col min-w-20 w-20 absolute min-h-screen top-0 left-0 bg-[#744192] text-white select-none',
        open && 'w-64 md:w-64 min-w-64 flex'
      )}
    >
      <div
        className={clsx(
          'flex px-4 py-2 justify-between items-center bg-bgPrimary h-full',
          open ? 'w-64 min-w-64' : 'w-20'
        )}
      >
        <div className="flex items-center space-x-3">
          <Image src={'/contable-logo.png'} width={50} height={50} alt="aaa" />
          {open && <h3 className="text-lg text-white">Contable</h3>}
        </div>
        <span className="flex md:hidden cursor-pointer" onClick={setOpen}>
          <SidebarCloseIcon />
        </span>
      </div>
      <ul className="w-full px-8 space-y-5 py-8">
        {links.map(({ label, href, icon }) => (
          <li key={`${label} ${href}`}>
            <Link href={href} className="flex gap-x-5 items-center">
              {open
                ? (
                <>
                  {icon} {label}
                </>
                  )
                : (
                <>{icon}</>
                  )}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
