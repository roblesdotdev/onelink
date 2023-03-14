import { db } from './db.server'

export async function createLinks({
  userId,
  url,
  title,
}: {
  url: string
  title: string
  userId: string
}) {
  return db.link.create({
    data: {
      url,
      title,
      userId: userId,
    },
  })
}
