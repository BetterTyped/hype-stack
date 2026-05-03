import noDynamicImport from "./no-dynamic-import.ts";
import noJsonErrorResponse from "./no-json-error-response.ts";
import requireJsonGenericType from "./require-json-generic-type.ts";
import requireRouteCrumb from "./require-route-crumb.ts";

// ESLint-compatible plugin shape consumed by Oxlint's `jsPlugins`.
// eslint-disable-next-line import/no-default-export
export default {
  meta: {
    name: "rules",
  },
  rules: {
    "no-dynamic-import": noDynamicImport,
    "no-json-error-response": noJsonErrorResponse,
    "require-json-generic-type": requireJsonGenericType,
    "require-route-crumb": requireRouteCrumb,
  },
};
