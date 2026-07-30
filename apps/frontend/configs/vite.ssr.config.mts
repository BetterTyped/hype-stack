import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { reactCompilerPreset } from "@vitejs/plugin-react";
import react from "@vitejs/plugin-react";
import { existsSync } from "fs";
import { nitro } from "nitro/vite";
import path from "node:path";
import { defineConfig, loadEnv, type UserConfigFnObject } from "vite";
import svgr from "vite-plugin-svgr";

import { validateEnv } from "../src/env/env.config.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { config } from "./vite.base.config.js";

const getFrontendRoot = () => {
  const cwd = process.cwd();

  if (existsSync(path.join(cwd, "configs", "vite.web.config.mts"))) {
    return cwd;
  }

  return path.join(cwd, "apps/frontend");
};

const frontendRoot = getFrontendRoot();

// eslint-disable-next-line import/no-default-export
export default defineConfig((props) => {
  // Env can come from a local file (dev) or purely from process.env (CI, Railway,
  // Pages). validateEnv throws a precise error listing any missing VITE_* vars.
  validateEnv({
    ...loadEnv(props.mode, frontendRoot, ""),
    ...process.env,
  });
  const baseConfig = config({ ...props, isSsrBuild: true });

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
      tailwindcss(),
      ...(baseConfig.plugins || []),
      react(),
      nitro(),
      babel({ presets: [reactCompilerPreset()] }),
      svgr(),
    ],
  } as ReturnType<UserConfigFnObject>;
});
