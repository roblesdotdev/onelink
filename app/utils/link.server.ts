import { db } from './db.server'
import type { User, Link } from '~/types'

export async function getPublicUserLinks(userId: User['id']): Promise<Link[]> {
  return db.link.findMany({
    where: { userId, published: true },
  })
}

export async function getUserLinks(userId: User['id']): Promise<Link[]> {
  return db.link.findMany({ where: { userId } })
}

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

export async function deleteLink(id: Link['id']) {
  return db.link.delete({ where: { id } })
}

export async function toggleLinkVisibility({
  id,
  published,
}: {
  id: Link['id']
  published: boolean
}) {
  return db.link.update({ where: { id }, data: { published } })
}
