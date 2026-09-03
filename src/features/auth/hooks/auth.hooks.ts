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
    onError: (e) => toast.error(getErrorMessage(e)),
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
      toast.success('Account created — you can now sign in')
      router.push('/auth/signin')
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