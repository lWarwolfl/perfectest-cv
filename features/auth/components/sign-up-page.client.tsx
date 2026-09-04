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
import { AuthBrand, GoogleButton, AuthDivider } from '@/features/auth/components/auth-brand'
import { useSignUp } from '@/features/auth/hooks/auth.hooks'
import { signUpSchema, type TSignUp } from '@/features/auth/schemas/auth.schema'

export function SignUpPageClient() {
  const signUp = useSignUp()
  const form = useForm<TSignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  return (
    <div className="w-full max-w-sm space-y-6">
      <AuthBrand />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Build your first resume in minutes</CardDescription>
        </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) =>
            signUp.mutate({ name: data.name, email: data.email, password: data.password })
          )}
          className="flex flex-col gap-4"
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input {...field} id="name" placeholder="Your name" autoComplete="name" />
                {fieldState.invalid && <FieldError errors={[fieldState.error?.message]} />}
              </Field>
            )}
          />
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
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input {...field} id="password" type="password" autoComplete="new-password" />
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
                <Input {...field} id="confirmPassword" type="password" autoComplete="new-password" />
                {fieldState.invalid && <FieldError errors={[fieldState.error?.message]} />}
              </Field>
            )}
          />
          <Button type="submit" disabled={signUp.isPending} className="w-full">
            {signUp.isPending ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>
        <div className="mt-4 space-y-3">
          <AuthDivider />
          <GoogleButton label="Sign up with Google" />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
    </div>
  )
}