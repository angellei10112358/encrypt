import { describe, it, expect } from 'vitest';
import { encryptText, decryptText } from '../js/crypto.js';

// Shim browser environment for Node.js
// Node.js 19+ already has globalThis.crypto, TextEncoder, and TextDecoder.
globalThis.window = {
    btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
    atob: (b64) => Buffer.from(b64, 'base64').toString('binary')
};

describe('CryptoEngine', () => {
    const plain = 'Hello, World! 🚀 中文测试';
    const pass = 'super-secret-passphrase';

    it('should encrypt and decrypt correctly', async () => {
        const cipher = await encryptText(plain, pass);
        expect(cipher).not.toBe(plain);
        
        const decrypted = await decryptText(cipher, pass);
        expect(decrypted).toBe(plain);
    });

    it('should fail decryption with wrong passphrase', async () => {
        const cipher = await encryptText(plain, pass);
        await expect(decryptText(cipher, 'wrong-pass')).rejects.toThrow('DECRYPTION_FAILED');
    });

    it('should fail decryption with corrupted ciphertext', async () => {
        const cipher = await encryptText(plain, pass);
        const corrupted = cipher.substring(0, cipher.length - 5) + 'AAAAA';
        await expect(decryptText(corrupted, pass)).rejects.toThrow();
    });

    it('should produce different ciphertexts for the same input (due to random salt/IV)', async () => {
        const cipher1 = await encryptText(plain, pass);
        const cipher2 = await encryptText(plain, pass);
        expect(cipher1).not.toBe(cipher2);
    });

    it('should handle empty strings', async () => {
        const empty = '';
        const cipher = await encryptText(empty, pass);
        const decrypted = await decryptText(cipher, pass);
        expect(decrypted).toBe(empty);
    });
});
