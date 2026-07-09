const PBKDF2_ITERATIONS = 600000;
const SALT_SIZE = 16;
const IV_SIZE = 12;
const VERSION = 0x01;

export function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function deriveKey(passphrase, salt) {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptText(plain, passphrase) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
    const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
    const key = await deriveKey(passphrase, salt);
    
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(plain)
    );

    const result = new Uint8Array(1 + SALT_SIZE + IV_SIZE + encrypted.byteLength);
    result[0] = VERSION;
    result.set(salt, 1);
    result.set(iv, 1 + SALT_SIZE);
    result.set(new Uint8Array(encrypted), 1 + SALT_SIZE + IV_SIZE);

    return arrayBufferToBase64(result.buffer);
}

export async function decryptText(cipherB64, passphrase) {
    let data;
    try {
        data = new Uint8Array(base64ToArrayBuffer(cipherB64));
    } catch (e) {
        throw new Error('INVALID_FORMAT');
    }

    if (data.length < 1 + SALT_SIZE + IV_SIZE) {
        throw new Error('INVALID_FORMAT');
    }

    const version = data[0];
    if (version !== VERSION) {
        throw new Error('UNSUPPORTED_VERSION');
    }

    const salt = data.slice(1, 1 + SALT_SIZE);
    const iv = data.slice(1 + SALT_SIZE, 1 + SALT_SIZE + IV_SIZE);
    const ciphertext = data.slice(1 + SALT_SIZE + IV_SIZE);

    const key = await deriveKey(passphrase, salt);

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}
