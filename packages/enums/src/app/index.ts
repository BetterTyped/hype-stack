export const appConfig = {
  id: "hype-stack",
  name: "Hype Stack",
  description: "Create your own hype-stack!",
  repository: {
    owner: "BetterTyped",
    name: "hype-stack",
  },
} as const;

export type AppConfig = typeof appConfig;
