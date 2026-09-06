'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AuthBrand } from '@/features/auth/components/auth-brand'
import { useResetPassword } from '@/features/auth/hooks/auth.hooks'
import { resetPasswordSchema, type TResetPassword } from '@/features/auth/schemas/auth.schema'

export function ResetPasswordPageClient() {
  const params = useSearchParams()
  const reset = useResetPassword()
  const [tokenError, setTokenError] = useState('')
  const form = useForm<TResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (!params.get('token'))
      setTokenError('This reset link is missing its token. Request a new one.')
  }, [params])

  return (
    <div className="w-full max-w-sm space-y-6">
      <AuthBrand />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>Choose a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {tokenError ? (
            <div className="space-y-4">
              <p className="text-destructive text-sm">{tokenError}</p>
              <Button render={<Link href="/auth/forgot-password" />}>Request new link</Button>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit((data) =>
                reset.mutate({ newPassword: data.newPassword })
              )}
              className="flex flex-col gap-4"
            >
              <Controller
                name="newPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                    <Input
                      {...field}
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error?.message]} />}
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error?.message]} />}
                  </Field>
                )}
              />
              <Button type="submit" disabled={reset.isPending} className="w-full">
                {reset.isPending ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
