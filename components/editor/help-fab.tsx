'use client'

import { CircleHelp } from 'lucide-react'

export function HelpFab({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="fixed right-6 bottom-6 z-40 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-white shadow-xl shadow-fuchsia-500/30 ring-1 ring-white/40 transition-transform outline-none hover:scale-105 focus-visible:scale-105 active:scale-95"
    >
      <CircleHelp className="size-5" />
    </button>
  )
}
