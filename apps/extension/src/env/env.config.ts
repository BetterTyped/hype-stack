import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value ? value : undefined));

export const extensionEnvSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_ENVIRONMENT: z.string().min(1),
  VITE_SENTRY_AUTH_TOKEN: optionalString,
  VITE_SENTRY_DNS: optionalString,
});

export type ExtensionEnv = z.infer<typeof extensionEnvSchema>;

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

export const validateEnv = (env: Record<string, unknown>) => parseEnv(extensionEnvSchema, env);
