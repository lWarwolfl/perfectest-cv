'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AuthBrand, GoogleButton, AuthDivider } from '@/features/auth/components/auth-brand'
import { useSignIn } from '@/features/auth/hooks/auth.hooks'
import { signInSchema, type TSignIn } from '@/features/auth/schemas/auth.schema'

export function SignInPageClient() {
  const signIn = useSignIn()
  const form = useForm<TSignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <div className="w-full max-w-sm space-y-6">
      <AuthBrand />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Welcome back to Perfectest CV</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((data) => signIn.mutate(data))}
            className="flex flex-col gap-4"
          >
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error?.message]} />}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input {...field} id="password" type="password" autoComplete="current-password" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error?.message]} />}
                </Field>
              )}
            />
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-primary text-sm font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" disabled={signIn.isPending} className="w-full">
              {signIn.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 space-y-3">
            <AuthDivider />
            <GoogleButton label="Sign in with Google" />
          </div>
          <p className="text-muted-foreground mt-4 text-center text-sm">
            No account?{' '}
            <Link href="/auth/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
