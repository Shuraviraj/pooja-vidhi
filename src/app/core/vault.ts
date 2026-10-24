// Parivar page ka taala: username + password → chaabi (PBKDF2), us chaabi se data band (AES-GCM).
// Browser aur Node 24 dono mein WebCrypto ki same API hai, isliye `scripts/parivar.mts` bhi yahi file
// use karta hai. GitHub pe sirf band data (`Sealed`) jaata hai — bina password ke wo bas random bytes hai.
// Is file mein koi import nahi, taaki Node ise seedha chala sake.

/** Itni baar hash = ek password try karne mein ~1 second; andaaze se password todna bahut mehenga. */
const ITER = 600_000;

export type Sealed = { v: 1; iter: number; salt: string; iv: string; data: string };

type Bytes = Uint8Array<ArrayBuffer>;
const toB64 = (bytes: Bytes) => {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
};
const fromB64 = (s: string): Bytes => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** Username mein chhote-bade akshar ka farak nahi (phone keyboard pehla akshar bada kar deta hai). */
async function deriveKey(user: string, pass: string, salt: Bytes, iterations: number) {
  const secret = new TextEncoder().encode(`${user.trim().toLowerCase()}\n${pass}`);
  const base = await crypto.subtle.importKey('raw', secret, 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    true, // export ho sake — "is phone pe yaad rakhein" ke liye
    ['encrypt', 'decrypt'],
  );
}

export async function seal(value: unknown, user: string, pass: string): Promise<Sealed> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(user, pass, salt, ITER);
  const plain = new TextEncoder().encode(JSON.stringify(value));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  return { v: 1, iter: ITER, salt: toB64(salt), iv: toB64(iv), data: toB64(data) };
}

/** Is band data ke liye chaabi (har baar naya salt hota hai, isliye data ke saath hi banti hai). */
export const keyFor = (sealed: Sealed, user: string, pass: string) =>
  deriveKey(user, pass, fromB64(sealed.salt), sealed.iter);

/** Galat chaabi ho (ya data mein chhed-chhaad) to AES-GCM error phenkta hai. */
export async function unseal<T>(sealed: Sealed, key: CryptoKey): Promise<T> {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(sealed.iv) }, key, fromB64(sealed.data));
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}

/** Chaabi ↔ text, localStorage mein rakhne ke liye (password khud kabhi save nahi hota). */
export const exportKey = async (key: CryptoKey) => toB64(new Uint8Array(await crypto.subtle.exportKey('raw', key)));
export const importKey = (raw: string) => crypto.subtle.importKey('raw', fromB64(raw), 'AES-GCM', true, ['decrypt']);
