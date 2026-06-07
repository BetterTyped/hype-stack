import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, type UserConfigFnObject } from "vite";
import svgr from "vite-plugin-svgr";

import { validateEnv } from "../src/env/env.config.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { config } from "./vite.base.config.js";

// eslint-disable-next-line import/no-default-export
export default defineConfig((props) => {
  validateEnv(process.env);
  const baseConfig = config(props);

  return {
    ...baseConfig,
    build: {
      ...baseConfig.build,
      rollupOptions: {
        ...baseConfig.build?.rollupOptions,
        external: [],
      },
    },
    server: {
      ...baseConfig.server,
      port: 4200,
      host: "localhost",
    },
    preview: {
      ...baseConfig.preview,
      port: 4300,
      host: "localhost",
    },
    plugins: [
      ...(baseConfig.plugins || []),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      svgr(),
    ],
  } as ReturnType<UserConfigFnObject>;
});
