'use server'

import ImageKit from '@imagekit/nodejs'
import { getCurrentUser } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
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
  const folder = data.folder || 'perfectest_cv'

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

export async function replaceImageAction(data: {
  name: string
  image: Blob
  folder?: string
  oldFileId?: string
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  if (data.oldFileId) await deleteImageAction(data.oldFileId)
  return uploadImageAction(data)
}

export async function deleteImageAction(fileId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')

  const [img] = await db
    .select()
    .from(Image)
    .where(and(eq(Image.fileId, fileId), eq(Image.userId, user.id)))
  if (!img) return false

  await imagekit.files.delete(fileId)
  await db.delete(Image).where(eq(Image.id, img.id))
  return true
}
