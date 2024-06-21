import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CommonBreadcrumbs from '@/components/breakcrumb'
import { headers } from 'next/headers'

export default async function Home ({ params }: any) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const balance = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/balance`, {
    method: 'GET',
    headers: new Headers(headers())
  })

  const resp = await balance.json()

  return (
    <div className="w-full h-full flex flex-col items-center px-3 md:px-7">
      <div className="relative top-0 left-0 w-full mx-auto py-6">
        <CommonBreadcrumbs />
      </div>
      <div className="relative w-full h-full max-h-[calc(100%-100px)] bg-white rounded-md px-3 py-2">
        {JSON.stringify(resp, null, 2)}
      </div>
    </div>
  )
}
