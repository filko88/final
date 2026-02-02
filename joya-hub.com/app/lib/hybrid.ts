import { createDecipheriv } from 'node:crypto'
import { decryptWithKeyId } from './keyManager'

export type HybridPayload = { i: string; k: string; v: string; d: string }

export function decryptHybrid(payload: HybridPayload): string {
  const { i, k, v, d } = payload
  if (!i || !k || !v || !d) throw new Error('Invalid hybrid payload')
  const symKey = Buffer.from(decryptWithKeyId(i, k), 'base64')
  const iv = Buffer.from(v, 'base64')
  const full = Buffer.from(d, 'base64')
  if (full.length < 17) throw new Error('Cipher too short')
  const tag = full.subarray(full.length - 16)
  const ct = full.subarray(0, full.length - 16)
  const decipher = createDecipheriv('aes-256-gcm', symKey, iv)
  decipher.setAuthTag(tag)
  const out = Buffer.concat([decipher.update(ct), decipher.final()])
  return out.toString('utf8')
}


