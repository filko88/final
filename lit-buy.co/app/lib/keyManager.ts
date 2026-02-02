import { generateKeyPairSync, privateDecrypt, constants, randomBytes, createHash } from 'node:crypto'

type KeyRecord = {
  id: string
  createdAt: number
  publicDerBase64: string
  privatePem: string
}

const ROTATE_MS = 30 * 60 * 1000 // 30 minutes (dev-only rotation)
const GRACE_MS = 10 * 60 * 1000  // keep old keys for 10 minutes after rotation

let active: KeyRecord | null = null
const oldKeys = new Map<string, KeyRecord>()

// Some hosting platforms disallow dashes in env var names.
// Read both the dash and underscore variants (case-insensitive) to be resilient.
function getEnv(name: string): string | undefined {
  const underscore = name.replace(/-/g, '_')
  const upper = underscore.toUpperCase()
  return process.env[name] ?? process.env[underscore] ?? process.env[upper]
}

function now() { return Date.now() }

function createKey(): KeyRecord {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })
  const id = randomBytes(8).toString('hex')
  const publicDerBase64 = Buffer.from(publicKey).toString('base64')
  return { id, createdAt: now(), publicDerBase64, privatePem: privateKey }
}

function ensureActive(): void {
  const t = now()
  if (!active) {
    // Prefer environment-provided static keys in production
    const envPub = getEnv('Rep-Finds_RSA_PUBLIC_DER_BASE64')
    const envPriv = getEnv('Rep-Finds_RSA_PRIVATE_PEM')
    if (process.env.NODE_ENV === 'production' && envPub && envPriv) {
      const id = getEnv('Rep-Finds_RSA_KEY_ID') || createHash('sha256').update(envPub).digest('hex').slice(0, 16)
      active = { id, createdAt: Number.MAX_SAFE_INTEGER, publicDerBase64: envPub, privatePem: envPriv }
      return
    }
    // Dev fallback: generate and allow rotation
    active = createKey()
    return
  }
  // Only rotate in non-production scenarios where we generated keys locally
  if (process.env.NODE_ENV !== 'production' && active.createdAt !== Number.MAX_SAFE_INTEGER && (t - active.createdAt >= ROTATE_MS)) {
    oldKeys.set(active.id, active)
    for (const [k, rec] of oldKeys) {
      if (t - rec.createdAt > ROTATE_MS + GRACE_MS) oldKeys.delete(k)
    }
    active = createKey()
  }
}

export function getActivePublicKey(): { i: string; s: string } {
  ensureActive()
  return { i: active!.id, s: active!.publicDerBase64 }
}

export function decryptWithKeyId(keyId: string, encryptedBase64: string): string {
  ensureActive()
  const rec = keyId === active!.id ? active! : oldKeys.get(keyId)
  if (!rec) throw new Error('Invalid key id')
  const buf = Buffer.from(encryptedBase64, 'base64')
  const dec = privateDecrypt({
    key: rec.privatePem,
    padding: constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256',
  }, buf)
  return dec.toString('utf8')
}


