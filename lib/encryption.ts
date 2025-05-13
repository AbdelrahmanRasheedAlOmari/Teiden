import crypto from 'crypto';

// Make sure the encryption key is at least 32 bytes
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-for-development-only';

// Pad or truncate key to exactly 32 bytes
const getKey = () => {
  const keyBuffer = Buffer.from(ENCRYPTION_KEY);
  if (keyBuffer.length === 32) return keyBuffer;
  
  const paddedKey = Buffer.alloc(32);
  keyBuffer.copy(paddedKey, 0, 0, Math.min(keyBuffer.length, 32));
  return paddedKey;
};

// Encryption helper functions
export const encryption = {
  /**
   * Encrypts sensitive data
   * @param text Text to encrypt
   * @returns Encrypted text
   */
  encrypt: (text: string): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data (IV is needed for decryption)
    return iv.toString('hex') + ':' + encrypted;
  },
  
  /**
   * Decrypts sensitive data
   * @param encryptedText Text to decrypt
   * @returns Decrypted text
   */
  decrypt: (encryptedText: string): string => {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
};

export default encryption; 