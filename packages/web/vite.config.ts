import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const serverPort = process.env.SLOCK_SERVER_PORT || "3001";
const serverTarget = `http://localhost:${serverPort}`;
const devPort = process.env.VITE_DEV_PORT ? Number(process.env.VITE_DEV_PORT) : 5173;

// Optional comma-separated list of extra hostnames the dev server should
// accept. Use this when exposing the local dev server through a tunnel
// (cloudflared / ngrok / tailscale serve) for a remote preview reviewer.
// Vite supports leading-dot wildcards (e.g. `.trycloudflare.com`). Leave
// unset for the standard local-only behavior.
const extraAllowedHosts = (process.env.VITE_DEV_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [".trycloudflare.com", ".loca.lt"],
    port: devPort,
    ...(extraAllowedHosts.length > 0 ? { allowedHosts: extraAllowedHosts } : {}),
    proxy: {
      "/api": {
        target: serverTarget,
        changeOrigin: true,
      },
      "/internal": {
        target: serverTarget,
        changeOrigin: true,
      },
      "/socket.io": {
        target: serverTarget,
        ws: true,
      },
      "/daemon": {
        target: serverTarget,
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-markdown": ["react-markdown", "remark-breaks", "remark-gfm", "rehype-raw", "rehype-sanitize"],
          "vendor-socketio": ["socket.io-client"],
        },
      },
    },
  },
});
