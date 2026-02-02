import secrets from './secrets';
import fetch from 'node-fetch';

const POLL_INTERVAL_MS = parseInt(process.env.SECRETS_WATCHER_INTERVAL_MS || '60000');
const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK_URL || process.env.ALERT_WEBHOOK;

const store: Record<string, string | undefined> = {};

async function checkOnce(names: string[]) {
  for (const n of names) {
    try {
      const val = await secrets.getSecret(n);
      const prev = store[n];
      if (prev === undefined && val !== undefined) {
        store[n] = val;
        continue;
      }
      if (prev !== undefined && val !== undefined && prev !== val) {
        // rotation detected
        store[n] = val;
        const msg = `Secret rotated: ${n}`;
        console.warn('[secretsWatcher]', msg);
        if (ALERT_WEBHOOK) {
          try {
            await fetch(ALERT_WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event: 'secret_rotated', secret: n, timestamp: new Date().toISOString() })
            });
          } catch (e) {
            console.error('[secretsWatcher] failed to send webhook', e);
          }
        }
      }
    } catch (e) {
      // ignore per-secret failures
    }
  }
}

export function startSecretsWatcher() {
  const list = (process.env.AZURE_KEY_VAULT_PRELOAD || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!list.length) return;
  // initial load
  checkOnce(list).catch(() => {});
  setInterval(() => checkOnce(list).catch(() => {}), POLL_INTERVAL_MS);
}

export default { startSecretsWatcher };
