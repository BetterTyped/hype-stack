// oxlint-disable rules/no-dynamic-import
const appType = import.meta.env.VITE_APP_TYPE;

if (appType === "web") {
  import("./index");
}
