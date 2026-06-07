/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-default-export */
/// <reference types="vite/client" />

import type { FullEnv } from "./env/env.config";

declare global {
  interface Window {
    electron?: unknown;
    api?: unknown;
  }
}

// Injected at build time from Vite config
declare const __APP_VERSION__: string;

interface ImportMetaEnv extends Readonly<FullEnv> {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.png" {
  const value: string;
  export default value;
}
