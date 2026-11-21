// Screenshot cases of the docs examples, for vcase's React adapter (botiverse/vcase,
// packages/react). A composition becomes a case by `export const meta = vcase({ id })`
// inside its strip markers (src/lib/vcase.ts). .github/workflows/vcase.yml builds the site,
// serves it and verifies every case against vcase/goldens/web-chromium; goldens come from
// that job, never from a laptop, since Chromium's pixels depend on its build and the OS.
export default {
  project: "raft-design",
  defaults: {
    theme: ["light", "dark"],
    // The phone view of an `example` block: its iframe is 375 × 560
    // (src/components/site/example-block.tsx). Named as the mobile app's vcase host names its
    // phone viewport (RaftVCaseHost), so `parity` pairs the two platforms' goldens.
    viewport: [{ name: "compact", w: 375, h: 560, density: 2 }],
    locale: ["en"],
    pointer: ["touch"],
  },
  sources: [
    { glob: "src/modules/**/*.composition.tsx", base: "src/modules", suffix: ".composition.tsx" },
  ],
  // The `example` key (`button/compositions/preview`) in the phone view's own page.
  url: "/iframe/example?path={key}&mode={theme}",
  baseURL: "http://127.0.0.1:4173",
  // The built site (pnpm run build) in the Workers runtime, as it is deployed.
  server: { command: "pnpm run preview --host 127.0.0.1 --port 4173 --strictPort" },
  // The page wraps the example in a `display: contents` element (routes/iframe/example.tsx).
  rootSelector: "[data-vcase-root] > *",
  // Space Grotesk and Space Mono, from Google Fonts as on the deployed site
  // (packages/ui/src/fonts.css).
  allowedOrigins: ["https://fonts.googleapis.com", "https://fonts.gstatic.com"],
  manifest: "vcase/vcase.manifest.json",
  goldens: "vcase/goldens",
  out: "vcase/build",
};
