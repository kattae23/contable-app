'use client'
import { navbarStore } from '@/store/navbar.store'
import clsx from 'clsx'
import React from 'react'

export default function MainLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const { open } = navbarStore()
  return (
    <>
      <main
        className={clsx(
          'w-full h-[calc(100vh-64px)] top-16 relative flex flex-col bg-[#E0E3E5]',
          open
            ? 'ml-64 w-[calc(100%-256px)]'
            : 'ml-0 md:ml-20 w-[calc(100%-80px)]'
        )}
      >
        {children}
      </main>
    </>
  )
}
