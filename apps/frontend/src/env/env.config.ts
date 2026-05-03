import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value ? value : undefined));

export const frontendEnvSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_APP_TYPE: z.enum(["web", "app"]),
  VITE_ENVIRONMENT: z.string().min(1),
  VITE_PUBLIC_POSTHOG_HOST: optionalString,
  VITE_PUBLIC_POSTHOG_KEY: optionalString,
  VITE_SENTRY_AUTH_TOKEN: optionalString,
  VITE_SENTRY_DNS: optionalString,
});

export const forgeEnvSchema = z.object({
  APPLE_ID: optionalString,
  APPLE_PASSWORD: optionalString,
  APPLE_TEAM_ID: optionalString,
  GITHUB_TOKEN: optionalString,
  SIGN_ID: optionalString,
});

export const productionForgeEnvSchema = z.object({
  APPLE_ID: z.string().min(1),
  APPLE_PASSWORD: z.string().min(1),
  APPLE_TEAM_ID: z.string().min(1),
  GITHUB_TOKEN: z.string().min(1),
  SIGN_ID: z.string().min(1),
});

export type FrontendEnv = z.infer<typeof frontendEnvSchema>;
export type ForgeEnv = z.infer<typeof forgeEnvSchema>;
export type FullEnv = FrontendEnv & ForgeEnv;

const parseEnv = <Schema extends z.ZodType>(schema: Schema, env: Record<string, unknown>): z.infer<Schema> => {
  try {
    return schema.parse(env);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessage = z.prettifyError(err);
      throw Object.assign(new Error(`Missing or invalid environment variables:\n  ${errorMessage}`), { cause: err });
    }

    throw err;
  }
};

export const validateEnv = (env: Record<string, unknown>) => parseEnv(frontendEnvSchema, env);

export const validateForgeEnv = (env: Record<string, unknown>, isProduction = false) => {
  return parseEnv(isProduction ? productionForgeEnvSchema : forgeEnvSchema, env);
};
