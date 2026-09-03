"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={cn("mb-1", className)} {...props} />
}

function FieldError({
  className,
  errors,
  ...props
}: React.ComponentProps<"ul"> & { errors?: (React.ReactNode | undefined)[] }) {
  const items = (errors || []).filter(Boolean) as React.ReactNode[]
  if (!items.length) return null
  return (
    <ul className={cn("mt-1 list-disc pl-4 text-sm text-destructive", className)} {...props}>
      {items.map((error, i) => (
        <li key={i}>{error}</li>
      ))}
    </ul>
  )
}

export { Field, FieldLabel, FieldError }
