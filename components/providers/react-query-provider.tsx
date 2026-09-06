'use client'

import { getErrorMessage } from '@/lib/utils'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type PropsWithChildren } from 'react'
import { toast } from 'sonner'

export default function ReactQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            toast.error(getErrorMessage(error))
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error(getErrorMessage(error))
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: 0,
            retry: 3,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
