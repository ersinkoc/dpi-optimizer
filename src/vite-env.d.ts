/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PASSWORD?: string;
  readonly APP_PASSWORD?: string;
  readonly VITE_APP_URL?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
