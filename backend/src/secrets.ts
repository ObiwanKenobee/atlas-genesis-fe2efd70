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
    // Use require() for dynamic loading to avoid TypeScript module resolution issues
    let DefaultAzureCredential: any;
    let SecretClient: any;

    try {
      const identityModule = require('@azure/identity');
      DefaultAzureCredential = identityModule.DefaultAzureCredential;
      const keyvaultModule = require('@azure/keyvault-secrets');
      SecretClient = keyvaultModule.SecretClient;
    } catch (moduleErr) {
      // Azure SDK not installed — fall back to env
      console.warn('Azure SDK modules not available, falling back to env vars');
      enabled = false;
      client = null;
      return;
    }

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
    console.error(`Failed to get secret ${name}:`, err?.message || err);
    return undefined;
  }
}

export async function loadSecrets(names: string[]): Promise<Record<string, MaybeSecret>> {
  const results: Record<string, MaybeSecret> = {};

  await Promise.all(
    names.map(async (name) => {
      results[name] = await getSecret(name);
    })
  );

  return results;
}

export default { getSecret, loadSecrets };
