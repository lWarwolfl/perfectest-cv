'use server'

import ImageKit from '@imagekit/nodejs'
import { getCurrentUser } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import { db } from '@/drizzle'
import { Image } from '@/drizzle/schema'
import { getFileExtension } from '@/lib/utils'

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
})

export async function uploadImageAction(data: { name: string; image: Blob; folder?: string }) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')

  const arrayBuffer = await data.image.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const folder = data.folder || 'perfectest-cv'

  const result = await imagekit.files.upload({
    file: base64,
    fileName: `${data.name}-${Date.now()}.${getFileExtension(data.image)}`,
    folder,
  })

  if (!result.url) throw new Error('Image upload failed')

  return await db
    .insert(Image)
    .values({
      userId: user.id,
      name: data.name,
      url: result.url,
      fileId: result.fileId || '',
      size: String(data.image.size),
      type: data.image.type,
    })
    .returning()
}