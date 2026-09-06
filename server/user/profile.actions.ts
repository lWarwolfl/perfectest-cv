'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '@/drizzle'
import { Image, User } from '@/drizzle/schema'
import { requireUser } from '@/server/resume/resume.actions'
import { replaceImageAction } from '@/server/image/uploadImage.action'

export async function updateProfileAction(data: { name: string; image?: Blob }) {
  const user = await requireUser()
  const name = data.name.trim()
  if (!name) throw new Error('Name cannot be empty')

  let image = user.image
  if (data.image) {
    const [prev] = await db
      .select()
      .from(Image)
      .where(and(eq(Image.userId, user.id), eq(Image.name, 'profile-photo')))
    const [uploaded] = await replaceImageAction({
      name: 'profile-photo',
      image: data.image,
      folder: 'perfectest_cv/avatars',
      oldFileId: prev?.fileId,
    })
    if (uploaded) image = uploaded.url
  }

  const [updated] = await db
    .update(User)
    .set({ name, image })
    .where(eq(User.id, user.id))
    .returning()
  return { name: updated.name, image: updated.image }
}
