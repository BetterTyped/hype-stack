/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-default-export */
/// <reference types="vite/client" />
/// <reference types="chrome" />

import type { ExtensionEnv } from "./env/env.config";

declare global {
  // Injected at build time from Vite config
  const __APP_VERSION__: string;
}

interface ImportMetaEnv extends Readonly<ExtensionEnv> {}

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
