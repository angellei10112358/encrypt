# Secure Text Encryptor

A pure front-end, single-file web utility for secure text encryption and decryption using a passphrase.

## 🚀 Features

- **Zero Backend**: All cryptographic operations are performed locally in the browser using the native Web Crypto API.
- **Privacy First**: Plaintext and passphrases never leave your device. No data is sent to any server.
- **Self-Contained**: The entire tool is bundled into a single `index.html` file (HTML/CSS/JS inlined), allowing for offline use and easy auditing.
- **No Third-Party Dependencies**: No external JS libraries are used, eliminating supply chain risks.
- **Responsive Design**: Fully compatible with both PC and mobile browsers (iOS Safari, Android Chrome).

## 🔐 Security Architecture

The tool strictly follows industry-standard cryptographic practices:

| Component | Implementation |
| :--- | :--- |
| **Key Derivation** | PBKDF2 with SHA-256, $\ge$ 600,000 iterations |
| **Encryption** | AES-256-GCM (Authenticated Encryption) |
| **Randomness** | `crypto.getRandomValues()` for secure salt and IV generation |
| **Salt** | 16 bytes, randomly generated for every encryption |
| **IV** | 12 bytes, randomly generated for every encryption (GCM standard) |
| **Encoding** | UTF-8 (`TextEncoder`/`TextDecoder`) for cross-platform consistency |

### Ciphertext Format
The output is a Base64 encoded string with the following structure:
`[Version (1 byte)] + [Salt (16 bytes)] + [IV (12 bytes)] + [AES-GCM Ciphertext]`

## 🛠️ Usage

1.  **Encrypt**:
    *   Enter your plaintext and a strong passphrase.
    *   Click **Encrypt** to generate the ciphertext.
    *   Share the ciphertext and the passphrase with the recipient via **separate channels** (e.g., ciphertext via email, passphrase via a secure call).
2.  **Decrypt**:
    *   Paste the ciphertext and enter the correct passphrase.
    *   Click **Decrypt** to recover the original plaintext.

## ⚠️ Security Warnings

- **Secure Context**: This tool requires **HTTPS** (or `localhost`) to function, as the Web Crypto API and Clipboard API are disabled in insecure contexts.
- **Passphrase Strength**: While not enforced, it is highly recommended to use a long passphrase (e.g., 4+ random words) to resist offline brute-force attacks.
- **Trust Model**: Even with local execution, if the hosting server is compromised, the page code could be replaced. To mitigate this, download the `index.html` file and use it locally.

## 📄 License
Open source and free to use.
