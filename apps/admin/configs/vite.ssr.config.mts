import { defineConfig, type UserConfigFnObject } from "vite";
import svgr from "vite-plugin-svgr";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { config } from "./vite.base.config.js";

// eslint-disable-next-line import/no-default-export
export default defineConfig((props) => {
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
      port: 4100,
      host: "localhost",
    },
    preview: {
      ...baseConfig.preview,
      port: 4100,
      host: "localhost",
    },
    plugins: [...(baseConfig.plugins || []), svgr()],
  } as ReturnType<UserConfigFnObject>;
});
