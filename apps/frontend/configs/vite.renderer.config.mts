import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { UserConfigFnObject } from "vite";
import svgr from "vite-plugin-svgr";

import { config } from "./vite.base.config.js";

// https://vitejs.dev/config
// eslint-disable-next-line import/no-default-export
export default defineConfig((props) => {
  const options = config(props);
  return {
    ...options,
    plugins: [...(options.plugins || []), react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss(), svgr()],
  } as ReturnType<UserConfigFnObject>;
});
