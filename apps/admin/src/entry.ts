// oxlint-disable rules/no-dynamic-import
// oxlint-disable-next-line import/no-unassigned-import
import "@/assets/styles.css";

const appType = import.meta.env.VITE_APP_TYPE;

if (appType === "web") {
  import("./index");
}
