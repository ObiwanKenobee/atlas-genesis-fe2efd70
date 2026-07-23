# Dev Runbook — Atlas Genesis

Quick steps for developers to run and debug the platform locally.

Prereqs
- Node 18+
- npm
- Postgres (if running backend migrations)

Frontend
1. Install deps: `npm install`
2. Run dev: `npm run dev`
3. Build: `npm run build`
4. Preview (prod-like): `npm run preview` (default port 4173)

Backend
1. Install deps: `cd backend && npm install`
2. Start dev: `npm run dev` (uses ts-node-dev)
3. Build: `npm run build`
4. Health: `GET /health` returns JSON health

Sessions and Redis
- To enable Redis-backed sessions set `REDIS_URL` (e.g. `redis://localhost:6379`) and `SESSION_SECRET` in the environment.
- If `REDIS_URL` is not set the server will continue without Redis session storage.

Azure Key Vault (optional)
- To use Azure Key Vault for secrets, set `AZURE_KEY_VAULT_NAME` to your vault name and optionally `AZURE_KEY_VAULT_PRELOAD` to a comma-separated list of secret names to preload into `process.env` on startup (e.g. `JWT_ACCESS_SECRET,JWT_REFRESH_SECRET,SESSION_SECRET,ADMIN_API_KEY`).
- For authentication the backend supports `DefaultAzureCredential` (managed identity when running in Azure or a service principal locally). See https://learn.microsoft.com/azure/active-directory/develop/howto-create-service-principal-portal for creating a service principal for local development.
- Example local setup using service principal:

	```bash
	export AZURE_TENANT_ID=<tenant>
	export AZURE_CLIENT_ID=<client-id>
	export AZURE_CLIENT_SECRET=<client-secret>
	export AZURE_KEY_VAULT_NAME=<your-vault-name>
	export AZURE_KEY_VAULT_PRELOAD='JWT_ACCESS_SECRET,JWT_REFRESH_SECRET,SESSION_SECRET,ADMIN_API_KEY'
	npm run dev
	```

The secrets loader falls back to environment variables when Key Vault is not available so local development remains simple.

Startup checks
- In production the server will perform a fail-fast check for required secrets on startup. Set `REQUIRED_SECRETS` to a comma-separated list of secret names (defaults to `JWT_ACCESS_SECRET,JWT_REFRESH_SECRET,SESSION_SECRET,ADMIN_API_KEY,DATABASE_URL`).
- If any required secret is missing (and not available from Key Vault), the process will exit with non-zero status so orchestration (Kubernetes, App Service) can fail the deployment.

Example override to require additional secrets:

```bash
export REQUIRED_SECRETS='JWT_ACCESS_SECRET,JWT_REFRESH_SECRET,SESSION_SECRET,ADMIN_API_KEY,DATABASE_URL,REDIS_URL'
``` 


Feature flags
- Set env `FEATURE_FLAGS='{"new_ui":true}'` or `FEATURE_NEW_UI=true`
- Flags exposed at `GET /api/flags` and consumed by frontend at startup.

Admin feature flagging
- Use env `ADMIN_API_KEY` to set a shared admin token.
- To list flags (admin): `curl -H "X-Admin-Token: $ADMIN_API_KEY" http://localhost:3001/api/admin/flags`
- To set a flag: `curl -X POST -H "Content-Type: application/json" -H "X-Admin-Token: $ADMIN_API_KEY" -d '{"value":true}' http://localhost:3001/api/admin/flags/new_ui`

Persisting flags (optional)
- Run migrations in `backend/db/migrations` with `cd backend && npm run migrate`.
- After migration, flags will be stored in the `feature_flags` table and survive restarts.

Observability
- Metrics: `GET /metrics` (Prometheus format)
- Tracing: OTLP exporter via `OTEL_EXPORTER_OTLP_ENDPOINT`

Testing
- Run unit tests: `npm test`
- Run e2e locally: `npm run cy:open` or headless `npm run cy:run`

Deploy
- CI runs lint/build/tests. See `.github/workflows/*`.
