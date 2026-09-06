import type { Metadata } from 'next'
import './globals.css'
import WrappedProviders from '@/components/providers/wrapped-providers'
import { Geist } from 'next/font/google'
import { HOST } from '@/config'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  metadataBase: new URL(HOST + '/'),
  title: 'Perfectest CV - Resume Builder, Cover Letters & Job Tracker',
  description:
    'Build the perfect resume and cover letter, and track your job applications in one place. Professional templates, live preview, and a job application tracker.',
  keywords: [
    'Perfectest CV',
    'resume builder',
    'CV maker',
    'cover letter builder',
    'job application tracker',
    'resume templates',
    'job hunt',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn('h-full font-sans antialiased', geist.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <WrappedProviders>{children}</WrappedProviders>
      </body>
    </html>
  )
}
