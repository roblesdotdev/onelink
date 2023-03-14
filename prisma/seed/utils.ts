import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import type { Link, Password, User } from '~/types'

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

export function createLink(): Pick<Link, 'url' | 'title' | 'published'> {
  return {
    url: faker.internet.url(),
    title: faker.company.name(),
    published: faker.datatype.boolean(),
  }
}
