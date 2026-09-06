'use client'

import Image from 'next/image'
import logo from '@public/logo.svg'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'

export function AuthBrand() {
  return (
    <div className="flex flex-col items-center gap-3 pb-2">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 p-[1.5px] shadow-lg shadow-indigo-500/20">
        <div className="bg-background rounded-[14px] p-3">
          <Image alt="Perfectest CV logo" src={logo} className="size-12" />
        </div>
      </div>
      <div className="text-center">
        <p className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-xl font-bold text-transparent">
          Perfectest CV
        </p>
        <p className="text-muted-foreground text-sm">Build the perfect application, every time</p>
      </div>
    </div>
  )
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

export function GoogleButton({ label }: { label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() =>
        authClient.signIn.social({ provider: 'google', callbackURL: '/app/dashboard' })
      }
    >
      <GoogleIcon className="size-4" />
      {label}
    </Button>
  )
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-xs">or continue with email</span>
      <div className="bg-border h-px flex-1" />
    </div>
  )
}
