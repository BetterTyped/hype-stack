import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";
import { loadEnv } from "vite";

const env = loadEnv("", fileURLToPath(new URL(".", import.meta.url)), "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env.DATABASE_URL,
  },
});
