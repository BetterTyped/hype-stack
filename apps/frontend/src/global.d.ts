/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-default-export */
/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
/// <reference types="vite/client" />
// TanStack Start is what augments route options with `server.handlers`, which
// the /sitemap.xml and /robots.txt routes answer from. Nothing else in the app
// pulls the package in at type level - `server.ts` imports only its entry
// subpath - so the augmentation is referenced here, once, for the whole program.
/// <reference types="@tanstack/react-start" />

import type { ElectronAPI } from "@electron-toolkit/preload";

import type { ExtendedElectronAPI } from "./app/preload";
import type { FullEnv } from "./env/env.config";

declare global {
  interface Window {
    electron: ElectronAPI & ExtendedElectronAPI;
    api: unknown;
  }

  // Injected at build time from Vite config
  const __APP_VERSION__: string;

  // True only in the SSR build, where __root renders the document wrapper.
  const __SSR_SHELL__: boolean;
}

interface ImportMetaEnv extends Readonly<FullEnv> {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg?react" {
  import * as React from "react";
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare global {
  namespace React {
    interface ReactPortal {
      children?: React.ReactNode;
    }
  }
}
