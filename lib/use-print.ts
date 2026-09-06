'use client'

import { useEffect, useState } from 'react'

export function usePrintNode() {
  const [job, setJob] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (!job) return
    const prev = document.title
    document.title = job.name
    const t = setTimeout(() => {
      window.print()
      document.title = prev
      setJob(null)
    }, 150)
    return () => clearTimeout(t)
  }, [job])

  return { job, print: (id: string, name: string) => setJob({ id, name }) }
}
