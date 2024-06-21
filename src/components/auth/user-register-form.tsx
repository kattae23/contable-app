/* eslint-disable react/jsx-handler-names */
/* eslint-disable react/jsx-pascal-case */
'use client'

import * as React from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Icons } from '../icons-shad-cn'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import countryList from 'react-select-country-list'

interface UserRegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
  name: z.string().min(3, { message: 'name must be more than 3 characters' }),
  lastName: z
    .string()
    .min(3, { message: 'lastName must be more than 3 characters' }),
  secondLastName: z
    .string()
    .min(3, { message: 'secondLastName must be more than 3 characters' }),
  nacionality: z.string(),
  phone: z.string().min(3, { message: 'phone must be more than 3 characters' }),
  email: z
    .string()
    .min(2, {
      message: 'email must be at least 10 characters.'
    })
    .email('This is not a valid email.'),
  password: z
    .string()
    .min(8, {
      message: 'password must be at least 8 characters.'
    })
    .max(16, {
      message: 'password must be at max 16 characters'
    })
})

export interface CountryListProps {
  value: string
  label: string
}

export function UserRegisterForm ({
  className,
  ...props
}: UserRegisterFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const options = React.useMemo(
    () => countryList().getData() as CountryListProps[],
    []
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lastName: '',
      secondLastName: '',
      nacionality: '',
      email: '',
      password: '',
      phone: ''
    }
  })

  async function onSubmit (values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const data = await fetch(
      process.env.NEXT_PUBLIC_API_URL! + '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          lastName: values.lastName,
          secondLastName: values.secondLastName,
          nacionality: values.nacionality,
          phone: values.phone,
          email: values.email,
          password: values.password
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    )
    if (data.status !== 201) {
      const { msg } = await data.json()
      setError(msg)
      setIsLoading(false)
      return
    }

    const res = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: `${window.location.origin}`
    })
    if (res?.error) {
      setError(res?.error)
    } else {
      setError(null)
    }
    if (res?.url) router.push('/client/dashboard')
    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <Link
        href={process.env.NEXT_PUBLIC_URL + '/auth/login'}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-20 md:right-8 md:top-32'
        )}
      >
        Login
      </Link>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex gap-x-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Alice Doe"
                    type="text"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LastName</FormLabel>
                <FormControl>
                  <Input
                    placeholder="LastName"
                    type="text"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-x-3">
          <FormField
            control={form.control}
            name="secondLastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Second LastName</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Second LastName"
                    type="text"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nacionality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="item-aligned">
                    {options.map(({ value, label }, index) => (
                      <SelectItem
                        key={value + ' ' + label + index}
                        value={value}
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="email@example.com"
                  type="email"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="********"
                  autoComplete=""
                  type="password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="+1 500 500 500"
                  autoComplete=""
                  type="tel"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )
            : (
                'Sign In with Email'
              )}
        </Button>
        <div className="text-red-400 text-md text-center rounded p-2">
          {error && JSON.stringify(error)}
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() =>
          signIn('google', {
            redirect: false
          })
        }
      >
        {isLoading
          ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )
          : (
          <Icons.google className="mr-2 h-4 w-4" />
            )}{' '}
        Google
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() =>
          signIn('github', {
            redirect: false
          })
        }
      >
        {isLoading
          ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )
          : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
            )}{' '}
        Github
      </Button>
    </Form>
  )
}
