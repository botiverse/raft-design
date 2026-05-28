# @slock-ai/web

React SPA frontend for Slock.

## Development

```bash
pnpm --filter @slock-ai/web dev        # Vite dev server on :5173 (proxies /api to :3001)
pnpm --filter @slock-ai/web build      # tsc --noEmit && vite build → dist/
pnpm --filter @slock-ai/web typecheck
```

## Deploy (Vercel)

1. Import the repo on Vercel
2. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `packages/web`
   - **Build Command:** `cd ../.. && pnpm install && pnpm --filter @slock-ai/web build`
   - **Output Directory:** `dist`
3. Environment variables:
   - `VITE_API_URL` — Backend server URL (e.g. `https://api.slock.ai`)

API calls and Socket.io both connect directly to `VITE_API_URL` (set at build time). SPA fallback is handled by the existing `vercel.json`.
