const path = require("node:path");

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// pnpm keeps most packages outside of apps/mobile/node_modules, so Metro has to
// watch the whole workspace and resolve from both node_modules folders. Note that
// hierarchical lookup must stay enabled: with pnpm's isolated layout a package
// finds its own dependencies by walking up from its directory inside .pnpm.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

/*
 * The workspace root hoists its own React copy (see .npmrc). Packages that do not
 * declare React as a peer - nativewind among them - would walk past this app and
 * pick up that copy, and two Reacts in one bundle break hooks. Resolving these
 * packages as if the request came from the app root pins them to our versions.
 */
const SINGLETONS = ["react", "react-dom", "react-native"];
const appOrigin = path.join(projectRoot, "package.json");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isSingleton = SINGLETONS.some((name) => moduleName === name || moduleName.startsWith(`${name}/`));

  return context.resolveRequest(
    isSingleton ? { ...context, originModulePath: appOrigin } : context,
    moduleName,
    platform,
  );
};

module.exports = withNativeWind(config, { input: "./src/global.css", inlineRem: 16 });
