# Atlas Sanctum — MVP Scaffold (minimal)

This folder contains a minimal scaffold to start Phase 0 development. It's intentionally small: implementors can copy files into the main repo or use as a reference.

Structure
- frontend/ — React + Vite starter
- backend/ — Node + Express starter
- contracts/ — Hardhat starter
- infra/ — deployment notes and minimal terraform/helm placeholders

CI
- `.github/workflows/ci.yml` is provided to run lint/build/contract compile on PRs.

Next steps
- Customize each package.json, add real implementations, and wire to Supabase.
