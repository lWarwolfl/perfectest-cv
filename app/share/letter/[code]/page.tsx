import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicLetterAction } from '@/server/letter/letter.actions'
import { LetterRenderer } from '@/components/cover-letter/letter-renderer'
import { EMPTY_LETTER_DESIGN } from '@/features/letter/types'
import { pageDims } from '@/lib/page'
import { ShareFooter } from '@/components/common/share-footer'
import type { LetterDesign } from '@/features/letter/types'

interface SharePageProps {
  params: Promise<{ code: string }>
}

export const revalidate = 86400

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { code } = await params
  const letter = await getPublicLetterAction(code)
  return { title: `${letter?.title || 'Cover letter'} - Perfectest CV` }
}

export default async function SharedLetterPage({ params }: SharePageProps) {
  const { code } = await params
  const letter = await getPublicLetterAction(code)
  if (!letter) notFound()

  const design: LetterDesign = { ...EMPTY_LETTER_DESIGN, ...(letter.design || {}) }
  const { widthMm, heightMm } = pageDims('A4')

  return (
    <div className="preview-light min-h-screen bg-background py-6 flex flex-col items-center gap-0 px-4">
      <div
        className="w-full bg-white border border-border shadow-sm"
        style={{ maxWidth: widthMm * 3.78, aspectRatio: `${widthMm} / ${heightMm}` }}
      >
        <LetterRenderer form={letter} design={design} />
      </div>
      <ShareFooter />
    </div>
  )
}
