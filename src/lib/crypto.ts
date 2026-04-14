/**
 * Aurbit E2E Encryption Utils
 * Uses Web Crypto API (AES-GCM) for device-to-device security.
 */

// Generate a random key for the session (prototype)
// In a real production app, we would use ECDH for key exchange
export async function generateKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Convert a string to a format suitable for encryption
function strToBuf(str: string) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Convert encrypted buffer back to string
function bufToStr(buf: ArrayBuffer) {
  const decoder = new TextDecoder();
  return decoder.decode(buf);
}

/**
 * Encrypts content with a key
 * Returns a JSON string containing the IV and the cipher text (Base64)
 */
export async function encryptContent(content: string, key: CryptoKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = strToBuf(content);

  const cipherText = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );

  return JSON.stringify({
    iv: Array.from(iv),
    cipherText: btoa(String.fromCharCode(...new Uint8Array(cipherText)))
  });
}

/**
 * Decrypts content using a key and the provided IV/CipherText package
 */
export async function decryptContent(packageStr: string, key: CryptoKey) {
  try {
    const { iv, cipherText } = JSON.parse(packageStr);
    const ivArray = new Uint8Array(iv);
    const cipherBuffer = new Uint8Array(
      atob(cipherText).split("").map((c) => c.charCodeAt(0))
    );

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivArray,
      },
      key,
      cipherBuffer
    );

    return bufToStr(decrypted);
  } catch (e) {
    console.error("Decryption failed:", e);
    return "[Encrypted Message - Unreadable]";
  }
}

// Simple deterministic ID-based key generation for local prototype
// In production, we'd use a shared secret derived from P-256 keys
export async function getSharedKeyForConversation(conversationId: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(conversationId + "aurbit-secret-salt");
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  
  return await window.crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}
