/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-default-export */
/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
/// <reference types="vite/client" />

import type { ElectronAPI } from "@electron-toolkit/preload";

import type { ExtendedElectronAPI } from "./app/preload";
import type { FullEnv } from "./env/env.config";

declare global {
  interface Window {
    electron: ElectronAPI & ExtendedElectronAPI;
    api: unknown;
  }
}

// Injected at build time from Vite config
declare const __APP_VERSION__: string;

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
