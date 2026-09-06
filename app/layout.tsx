import type { Metadata } from 'next'
import './globals.css'
import WrappedProviders from '@/components/providers/wrapped-providers'
import {
  Geist,
  Inter,
  Roboto,
  Open_Sans,
  Lato,
  Montserrat,
  Poppins,
  Nunito_Sans,
  Source_Sans_3,
  Plus_Jakarta_Sans,
  Rubik,
  Work_Sans,
  DM_Sans,
  Lora,
  Merriweather,
  Playfair_Display,
  EB_Garamond,
  Source_Serif_4,
  PT_Serif,
  Libre_Baskerville,
  Crimson_Pro,
  JetBrains_Mono,
  IBM_Plex_Mono,
  Roboto_Mono,
  Geist_Mono,
} from 'next/font/google'
import { HOST } from '@/config'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const roboto = Roboto({ subsets: ['latin'], variable: '--font-roboto' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' })
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-poppins' })
const nunitoSans = Nunito_Sans({ subsets: ['latin'], variable: '--font-nunito-sans' })
const sourceSans3 = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans-3' })
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta-sans' })
const rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik' })
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work-sans' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' })
const merriweather = Merriweather({ subsets: ['latin'], variable: '--font-merriweather' })
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair-display' })
const ebGaramond = EB_Garamond({ subsets: ['latin'], variable: '--font-eb-garamond' })
const sourceSerif4 = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif-4' })
const ptSerif = PT_Serif({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pt-serif' })
const libreBaskerville = Libre_Baskerville({ subsets: ['latin'], variable: '--font-libre-baskerville' })
const crimsonPro = Crimson_Pro({ subsets: ['latin'], variable: '--font-crimson-pro' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-ibm-plex-mono' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

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
      className={cn(
        'h-full font-sans antialiased',
        geist.variable,
        inter.variable,
        roboto.variable,
        openSans.variable,
        lato.variable,
        montserrat.variable,
        poppins.variable,
        nunitoSans.variable,
        sourceSans3.variable,
        plusJakartaSans.variable,
        rubik.variable,
        workSans.variable,
        dmSans.variable,
        lora.variable,
        merriweather.variable,
        playfairDisplay.variable,
        ebGaramond.variable,
        sourceSerif4.variable,
        ptSerif.variable,
        libreBaskerville.variable,
        crimsonPro.variable,
        jetbrainsMono.variable,
        ibmPlexMono.variable,
        robotoMono.variable,
        geistMono.variable
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <WrappedProviders>{children}</WrappedProviders>
      </body>
    </html>
  )
}
