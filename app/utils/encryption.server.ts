import crypto from 'crypto'
import { getRequiredServerEnvVar } from './misc'

const algorithm = 'aes-256-ctr'
const ENCRYPTION_SECRET = getRequiredServerEnvVar('ENCRYPTION_SECRET')

const ENCRYPTION_KEY = crypto.scryptSync(ENCRYPTION_SECRET, 'salt', 32)

const IV_LENGTH = 16

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(text: string) {
  const [ivPart, encryptedPart] = text.split(':')
  if (!ivPart || !encryptedPart) {
    throw new Error('Invalid text.')
  }

  const iv = Buffer.from(ivPart, 'hex')
  const encryptedText = Buffer.from(encryptedPart, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv)
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ])
  return decrypted.toString()
}
