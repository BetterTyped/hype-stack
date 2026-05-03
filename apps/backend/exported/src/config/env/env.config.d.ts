import { z } from "zod";
export declare const envSchema: z.ZodObject<{
    FRONTEND_URL: z.ZodString;
    DATABASE_URL: z.ZodString;
    POSTGRES_USER: z.ZodOptional<z.ZodString>;
    POSTGRES_PASSWORD: z.ZodOptional<z.ZodString>;
    POSTGRES_DB: z.ZodOptional<z.ZodString>;
    VALKEY_PASSWORD: z.ZodOptional<z.ZodString>;
    VALKEY_URL: z.ZodString;
    RUSTFS_ENDPOINT: z.ZodString;
    RUSTFS_ACCESS_KEY: z.ZodString;
    RUSTFS_SECRET_KEY: z.ZodString;
    WORKOS_COOKIE_PASSWORD: z.ZodString;
    WORKOS_GOOGLE_OAUTH_CALLBACK: z.ZodString;
    RESEND_API_KEY: z.ZodString;
    SENTRY_DSN: z.ZodString;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
export declare const validateEnv: () => void;
//# sourceMappingURL=env.config.d.ts.map