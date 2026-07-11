import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type UserConfigFnObject } from "vite";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { config } from "./vite.base.config.js";

// eslint-disable-next-line import/no-default-export
export default defineConfig((props) => {
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
      port: 4100,
      host: "localhost",
    },
    preview: {
      ...baseConfig.preview,
      port: 4100,
      host: "localhost",
    },
    plugins: [...(baseConfig.plugins || []), react(), tailwindcss()],
  } as ReturnType<UserConfigFnObject>;
});
