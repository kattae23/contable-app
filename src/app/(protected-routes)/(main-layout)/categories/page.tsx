import { auth } from '@/auth'
import CommonBreadcrumbs from '@/components/breakcrumb'
import Categories from '@/components/categories/categories'
import { Icons } from '@/components/icons-shad-cn'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async () => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Icons.spinner className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    )
  }

  if (!session?.user) redirect('/auth/login')

  return (
    <div className="w-full h-full flex flex-col items-center px-3 md:px-7">
      <div className="relative top-0 left-0 w-full mx-auto py-6">
        <CommonBreadcrumbs />
      </div>
      <div className="relative w-full h-full max-h-[calc(100%-100px)] bg-white rounded-md px-3 py-2">
        <Categories user={user} />
      </div>
    </div>
  )
}

export default page
