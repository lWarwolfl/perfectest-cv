import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicLetterAction } from '@/server/letter/letter.actions'
import { LetterRenderer } from '@/components/cover-letter/letter-renderer'
import { normalizeLetterDesign } from '@/features/letter/types'
import { pageDims } from '@/lib/page'
import { ShareFooter } from '@/components/common/share-footer'
import type { LetterDesign } from '@/features/letter/types'

interface SharePageProps {
  params: Promise<{ code: string }>
}

export const revalidate = 86400

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { code } = await params
  const letter = await getPublicLetterAction(code)
  return { title: `${letter?.title || 'Cover letter'} - Perfectest CV` }
}

export default async function SharedLetterPage({ params }: SharePageProps) {
  const { code } = await params
  const letter = await getPublicLetterAction(code)
  if (!letter) notFound()

  const design = normalizeLetterDesign(letter.design as LetterDesign | null)
  const { widthMm } = pageDims(
    design.customization.regional?.pageFormat === 'US Letter' ? 'US Letter' : 'A4'
  )

  return (
    <div className="preview-light share-bg flex min-h-screen flex-col items-center gap-0 px-4 py-6">
      <div
        className="border-border w-full border bg-white shadow-sm"
        style={{ maxWidth: widthMm * 3.78 }}
      >
        <LetterRenderer form={letter} design={design} fit />
      </div>
      <ShareFooter />
    </div>
  )
}
