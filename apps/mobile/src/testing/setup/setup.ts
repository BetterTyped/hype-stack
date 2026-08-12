import { StyleSheet } from "nativewind";

/*
 * Metro compiles global.css and hands the resulting flags to the Nativewind
 * runtime. Vitest skips that step, so the runtime would reject manual theme
 * switching even though tailwind.config.js sets `darkMode: "class"`.
 */
StyleSheet.registerCompiled({ $compiled: true, flags: { darkMode: "class" } });
