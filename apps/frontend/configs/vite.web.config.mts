import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { existsSync } from "fs";
import path from "path";
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
