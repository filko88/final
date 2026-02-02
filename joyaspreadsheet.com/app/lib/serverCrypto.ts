import { generateKeyPairSync, privateDecrypt, constants } from "node:crypto"

// Module-scoped keypair generated at process start. For production, prefer loading from env.
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
})

export function getPublicKeyPEM(): string {
  return publicKey
}

export function decryptBase64RSAOAEP(encryptedBase64: string): string {
  const buf = Buffer.from(encryptedBase64, "base64")
  const decrypted = privateDecrypt(
    {
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buf
  )
  return decrypted.toString("utf8")
}


