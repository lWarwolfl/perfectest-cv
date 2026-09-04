'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AuthBrand } from '@/features/auth/components/auth-brand'
import { useForgotPassword } from '@/features/auth/hooks/auth.hooks'
import { forgotPasswordSchema, type TForgotPassword } from '@/features/auth/schemas/auth.schema'

export function ForgotPasswordPageClient() {
  const forgot = useForgotPassword()
  const form = useForm<TForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  return (
    <div className="w-full max-w-sm space-y-6">
      <AuthBrand />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((data) => forgot.mutate(data))}
            className="flex flex-col gap-4"
          >
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input {...field} id="email" type="email" placeholder="you@example.com" autoComplete="email" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error?.message]} />}
                </Field>
              )}
            />
            <Button type="submit" disabled={forgot.isPending} className="w-full">
              {forgot.isPending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered it?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
