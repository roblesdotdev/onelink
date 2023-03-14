import { db } from './db.server'

export function validateUsername(username: string) {
  return username.length < 4 ? 'Username is too short' : null
}

export function validatePassword(password: string) {
  return password.length < 6 ? 'Password is too short' : null
}

export function validateEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email) ? null : 'Enter a valid email'
}

export function validateConfirmPassword(password: string, confirm: string) {
  const error = validatePassword(confirm)
  return error
    ? error
    : password !== confirm
    ? 'Passwords does not match'
    : null
}

export async function validateEmailExistence(email: string) {
  const u = await db.user.findUnique({ where: { email } })
  return u ? 'Email is already taken' : null
}

export async function validateUsernameExistence(username: string) {
  const u = await db.user.findUnique({ where: { username } })
  return u ? 'Username is already taken' : null
}

export function validateUrl(url: string) {
  const re = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm
  return !re.test(url) ? 'Invalid url' : null
}

export function validateTitle(title: string) {
  return title.length < 5 ? 'Title is too short' : null
}
