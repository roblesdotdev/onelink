import bcrypt from 'bcryptjs'
import type { User } from '~/types'
import { db } from './db.server'

export async function getUserById(
  userId: User['id'],
): Promise<Pick<User, 'id' | 'username' | 'email'> | null> {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
    },
  })
}

export async function verifyCredentials({
  username,
  password,
}: {
  username: User['username']
  password: string
}) {
  const userWithPassword = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
    },
  })
  if (!userWithPassword || !userWithPassword.password) {
    return null
  }
  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  const { password: _pwd, ...safeUser } = userWithPassword
  return safeUser
}

export async function createUser({
  email,
  username,
  password,
}: Pick<User, 'email' | 'username'> & { password: string }) {
  const hashedPassword = await bcrypt.hash(password, 10)

  return db.user.create({
    data: {
      email,
      username,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}
