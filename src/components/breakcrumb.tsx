'use client'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { capitalize } from '@/utils/capitalice'
import { Fragment } from 'react'

const CommonBreadcrumbs = () => {
  const pathname = usePathname()
  const segments = pathname.split('/').filter((item) => item !== '')

  const items = segments.map((item, index) => {
    return {
      disabled: index === segments.length - 1,
      template: () => (
        <Fragment key={index}>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${segments.slice(0, index + 1).join('/')}`}>
              {capitalize(item)}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {index === segments.length && <BreadcrumbSeparator />}
        </Fragment>
      )
    }
  })

  return (
    <Breadcrumb className="ml-5">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item) => item.template())}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default CommonBreadcrumbs
