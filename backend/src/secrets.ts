/*
  secrets.ts
  - Loads secrets from Azure Key Vault when configured (AZURE_KEY_VAULT_NAME).
  - Falls back to process.env values when Key Vault not configured or SDK not available.
  - Provides `getSecret(name)` and `loadSecrets(names[])` helpers.
*/
import { env } from 'process';

type MaybeSecret = string | undefined;

let enabled = false;
let client: any = null;

async function initClient() {
  if (client || !process.env.AZURE_KEY_VAULT_NAME) return;

  try {
    // Lazy import to keep local dev simple when SDK not installed
    const { DefaultAzureCredential } = await import('@azure/identity');
    const { SecretClient } = await import('@azure/keyvault-secrets');
    const vaultUrl = `https://${process.env.AZURE_KEY_VAULT_NAME}.vault.azure.net`;
    const credential = new DefaultAzureCredential();
    client = new SecretClient(vaultUrl, credential);
    enabled = true;
     
    console.log('Azure Key Vault client initialized for', process.env.AZURE_KEY_VAULT_NAME);
  } catch (err) {
    // SDK not installed or auth issue — fall back to env
     
    console.warn('Azure Key Vault not initialized, falling back to env:', err?.message || err);
    enabled = false;
    client = null;
  }
}

export async function getSecret(name: string): Promise<MaybeSecret> {
  // Prefer env var if set
  const envName = name.toUpperCase();
  if (process.env[envName]) return process.env[envName];

  if (!process.env.AZURE_KEY_VAULT_NAME) return undefined;

  await initClient();
  if (!enabled || !client) return undefined;

  try {
    const resp = await client.getSecret(name);
    return resp && resp.value;
  } catch (err) {
     
    console.warn('Key Vault getSecret failed for', name, err?.message || err);
    return undefined;
  }
}

// Load a set of secrets and set them on process.env when missing
export async function loadSecrets(names: string[]) {
  if (!names || names.length === 0) return;

  await initClient();
  for (const n of names) {
    const envKey = n.toUpperCase();
    if (process.env[envKey]) continue; // don't overwrite existing env
    try {
      const val = await getSecret(n);
      if (val !== undefined) {
        process.env[envKey] = val;
      }
    } catch (e) {
      // ignore per-secret errors
    }
  }
}

// Optionally preload common secrets on import if AZURE_KEY_VAULT_PRELOAD is set (comma-separated)
if (process.env.AZURE_KEY_VAULT_PRELOAD) {
  const list = (process.env.AZURE_KEY_VAULT_PRELOAD || '').split(',').map((s) => s.trim()).filter(Boolean);
  // fire-and-forget; best-effort
  loadSecrets(list).catch(() => {});
}

export default { getSecret, loadSecrets };
