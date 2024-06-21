import Sidebar from '@/components/sidebar/sidebar'
import Navbar from '@/components/navbar/navbar'
import React, { Fragment } from 'react'

export default function ProtectedLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      <Sidebar />
      {children}
    </>
  )
}
