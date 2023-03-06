import bcrypt from 'bcryptjs'
import type { User, Password } from '~/types'

export function createUser(username: string): Pick<User, 'email' | 'username'> {
  return {
    username,
    email: `${username}@email.com`,
  }
}

export function createPassword(username: string): Pick<Password, 'hash'> {
  return {
    hash: bcrypt.hashSync(username.toUpperCase(), 10),
  }
}
