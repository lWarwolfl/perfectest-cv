'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { getErrorMessage } from '@/lib/utils'

export function useSignIn() {
  const router = useRouter()
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const { data: result, error } = await authClient.signIn.email(data)
      if (error) throw new Error(error.message || error.statusText)
      return result
    },
    onSuccess: () => {
      toast.success('Signed in successfully')
      router.push('/app/dashboard')
      router.refresh()
    },
    onError: (e) => {
      const msg = getErrorMessage(e)
      if (/verif/i.test(msg)) {
        toast.error('Verify your email first, then sign in')
        router.push('/auth/verify-email')
      } else {
        toast.error(msg)
      }
    },
  })
}

export function useSignUp() {
  const router = useRouter()
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const { data: result, error } = await authClient.signUp.email(data)
      if (error) throw new Error(error.message || error.statusText)
      return result
    },
    onSuccess: () => {
      toast.success('Account created, check your inbox to verify your email')
      router.push('/auth/verify-email')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSignOut() {
  const router = useRouter()
  return useMutation({
    mutationFn: async () => {
      await authClient.signOut()
    },
    onSuccess: () => {
      router.push('/auth/signin')
      router.refresh()
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: '/auth/reset-password',
      })
      if (error) throw new Error(error.message || error.statusText)
    },
    onSuccess: () => toast.success("If that email exists, we've sent a reset link"),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useResetPassword() {
  const router = useRouter()
  return useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      const { error } = await authClient.resetPassword({ newPassword: data.newPassword })
      if (error) throw new Error(error.message || error.statusText)
    },
    onSuccess: () => {
      toast.success('Password updated, sign in with your new password')
      router.push('/auth/signin')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const { error } = await authClient.sendVerificationEmail({
        email: data.email,
        callbackURL: '/auth/verified',
      })
      if (error) throw new Error(error.message || error.statusText)
    },
    onSuccess: () => toast.success('Verification email sent'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
