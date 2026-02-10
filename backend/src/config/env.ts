import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4100),
  APP_PUBLIC_URL: z.string().url().default("http://localhost:8081"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/pookiestudios?schema=public"),
  JWT_ACCESS_SECRET: z.string().min(16).default("dev_access_secret_change_me_123456"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev_refresh_secret_change_me_123456"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  STRIPE_SECRET_KEY: z.string().min(1).default("sk_test_replace_me"),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1).default("pk_test_replace_me"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).default("whsec_replace_me"),
  STRIPE_MERCHANT_COUNTRY: z.string().length(2).default("US"),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  APPLE_SERVICE_ID: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().default("hello@pookiestudios.com")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid env config: ${parsed.error.message}`);
}

const placeholderSecrets = [
  "dev_access_secret_change_me_123456",
  "dev_refresh_secret_change_me_123456",
  "sk_test_replace_me",
  "pk_test_replace_me",
  "whsec_replace_me"
];

if (
  parsed.data.NODE_ENV === "production" &&
  (placeholderSecrets.includes(parsed.data.JWT_ACCESS_SECRET) ||
    placeholderSecrets.includes(parsed.data.JWT_REFRESH_SECRET) ||
    placeholderSecrets.includes(parsed.data.STRIPE_SECRET_KEY) ||
    placeholderSecrets.includes(parsed.data.STRIPE_PUBLISHABLE_KEY) ||
    placeholderSecrets.includes(parsed.data.STRIPE_WEBHOOK_SECRET))
) {
  throw new Error("Production env cannot use default placeholder secrets. Set real values in backend/.env.");
}

for (const [key, value] of Object.entries(parsed.data)) {
  if (value !== undefined && process.env[key] === undefined) {
    process.env[key] = String(value);
  }
}

export const env = parsed.data;
