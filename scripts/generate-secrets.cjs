

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Manual .env parser to avoid external dependencies
 */
function parseEnv(content) {
    const config = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'" ) && value.endsWith("'")) value = value.slice(1, -1);
            config[key] = value;
        }
    });
    return config;
}

const envPath = path.resolve(process.cwd(), '.env');
let envConfig = {};
if (fs.existsSync(envPath)) {
    envConfig = parseEnv(fs.readFileSync(envPath, 'utf8'));
} else {
    console.warn('.env file not found, using process.env');
    envConfig = process.env;
}

// Master key for encryption - used to derive the AES key
const MASTER_KEY_STR = envConfig.MASTER_ENCRYPTION_KEY || 'docguard-nigeria-secure-key-2025-lma-edge';
const MASTER_KEY = crypto.createHash('sha256').update(MASTER_KEY_STR).digest();

/**
 * Encrypts text using AES-256-GCM
 */
function encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return {
        e: encrypted,
        i: iv.toString('hex'),
        t: tag.toString('hex')
    };
}

const secrets = {
    GEMINI_API_KEY: encrypt(envConfig.GEMINI_API_KEY || envConfig.VITE_GEMINI_API_KEY),
    SUPABASE_URL: encrypt(envConfig.SUPABASE_URL || envConfig.VITE_SUPABASE_URL),
    SUPABASE_ANON_KEY: encrypt(envConfig.SUPABASE_ANON_KEY || envConfig.VITE_SUPABASE_ANON_KEY)
};

const content = `/**
 * Encrypted Credentials for Production Bundle
 * Generated automatically by scripts/generate-secrets.cjs. Do not edit manually.
 */

const _S = ${JSON.stringify(secrets)};
const _K = '${MASTER_KEY_STR}';

async function decrypt(data: any): Promise<string> {
  if (!data || !data.e) return '';
  
  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(_K);
    const hash = await crypto.subtle.digest('SHA-256', keyData);
    const key = await crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const iv = new Uint8Array(data.i.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
    const tag = new Uint8Array(data.t.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
    const encrypted = new Uint8Array(data.e.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
    
    // Combine encrypted data and tag for SubtleCrypto (it expects [data, tag])
    const combined = new Uint8Array(encrypted.length + tag.length);
    combined.set(encrypted);
    combined.set(tag, encrypted.length);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      combined
    );
    
    return new TextDecoder().decode(decryptedBuffer);
  } catch (e) {
    console.error('Decryption failed:', e);
    return '';
  }
}

class SecretsManager {
  private static instance: SecretsManager;
  public GEMINI_API_KEY = '';
  public SUPABASE_URL = '';
  public SUPABASE_ANON_KEY = '';
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const [gemini, url, anon] = await Promise.all([
        decrypt(_S.GEMINI_API_KEY),
        decrypt(_S.SUPABASE_URL),
        decrypt(_S.SUPABASE_ANON_KEY)
      ]);
      this.GEMINI_API_KEY = gemini;
      this.SUPABASE_URL = url;
      this.SUPABASE_ANON_KEY = anon;
      this.initialized = true;
    })();

    return this.initPromise;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}

export const Secrets = SecretsManager.getInstance();
`;

const configDir = path.join(process.cwd(), 'src', 'config');
if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

fs.writeFileSync(path.join(configDir, 'secrets.ts'), content);
console.log('Secrets generated in src/config/secrets.ts using AES-256-GCM');
