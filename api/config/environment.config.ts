import dotenv from 'dotenv';
import { z } from 'zod';

function init() {
    dotenv.config();
}

const envSchema = z.object({
    ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    JWT_REFRESH_EXPIRES_IN: z.string()
});

function validateEnv() {
    init();
    const env = envSchema.parse(process.env);
    return env;
}

export default validateEnv();