import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value ? value : undefined));

/**
 * Only `EXPO_PUBLIC_*` variables are inlined into the bundle by Expo, so every
 * value the app reads at runtime has to use that prefix.
 */
export const mobileEnvSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.url(),
  EXPO_PUBLIC_ENVIRONMENT: z.string().min(1),
  EXPO_PUBLIC_SENTRY_DNS: optionalString,
});

export type MobileEnv = z.infer<typeof mobileEnvSchema>;

export const validateEnv = (env: Record<string, unknown>): MobileEnv => {
  try {
    return mobileEnvSchema.parse(env);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessage = z.prettifyError(err);
      throw Object.assign(new Error(`Missing or invalid environment variables:\n  ${errorMessage}`), { cause: err });
    }

    throw err;
  }
};

/**
 * Metro replaces `process.env.EXPO_PUBLIC_*` at build time only for statically
 * written property accesses, which is why each one is listed explicitly.
 */
export const env = validateEnv({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT,
  EXPO_PUBLIC_SENTRY_DNS: process.env.EXPO_PUBLIC_SENTRY_DNS,
});
