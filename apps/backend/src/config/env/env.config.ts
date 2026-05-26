import { z } from "zod";

export const envSchema = z.object({
  // # Internal
  FRONTEND_URL: z.string(),
  // # Postgres
  DATABASE_URL: z.string(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),
  // # Valkey
  VALKEY_PASSWORD: z.string().optional(),
  VALKEY_URL: z.string(),
  // # RustFS
  RUSTFS_ENDPOINT: z.string(),
  RUSTFS_ACCESS_KEY: z.string(),
  RUSTFS_SECRET_KEY: z.string(),
  // # Resend
  RESEND_API_KEY: z.string(),
  // # Sentry
  SENTRY_DSN: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = () => {
  try {
    envSchema.parse(process.env);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessage = z.prettifyError(err);
      throw new Error(`Missing environment variables:\n  ${errorMessage}`, { cause: err });
    }
  }
};
