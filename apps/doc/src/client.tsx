import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { setupRscHmr } from "virtual:tanstack-rsc-hmr";

import { loadTranslations } from "./lib/content/pages.ts";
import { localeOfPath } from "./lib/i18n/locales.ts";

setupRscHmr();

// The server rendered this page from its language's translations; the client
// needs them too before it hydrates (lib/content/pages.ts).
void loadTranslations(localeOfPath(window.location.pathname)).then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  });
});
