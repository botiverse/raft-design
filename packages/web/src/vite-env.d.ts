/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DEPLOYMENT_ENV?: string;
  readonly VITE_SLOCKDEV_ENV_NAME?: string;
  readonly VITE_SLOCKDEV_PREVIEW_DESCRIPTION?: string;
}
