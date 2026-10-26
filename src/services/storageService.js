export function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error(`Unable to read HireHub storage key "${key}".`, error);
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save HireHub storage key "${key}".`, error);
    throw new Error('Your browser could not save this change. Check available storage and try again.');
  }
}

export async function hashPassword(password, saltValue) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Secure password hashing is unavailable. Open HireHub on localhost or HTTPS.');
  }
  const salt = saltValue || window.crypto.getRandomValues(new Uint8Array(16));
  const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
  const toBase64 = (bytes) => window.btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return { salt: toBase64(salt), hash: toBase64(bits) };
}

export async function verifyPassword(password, salt, expectedHash) {
  const saltBytes = Uint8Array.from(window.atob(salt), (character) => character.charCodeAt(0));
  const result = await hashPassword(password, saltBytes);
  return result.hash === expectedHash;
}
