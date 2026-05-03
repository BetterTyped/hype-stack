/// <reference types="vitest/globals" />
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { resolve } from "path";

// Load .env.test for all tests -- this is cheap and every test needs env vars
const envConfig = config({ path: resolve(__dirname, "../../../.env.test"), quiet: true, override: true });
expand(envConfig);

process.env.NODE_ENV = "test";
