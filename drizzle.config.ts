import {defineConfig} from "drizzle-kit";
import * as dotenv from "dotenv";
import {error} from "console";

dotenv.config({
  path: ".env.local",
});

if (!process.env.DATABASE_URL) {
  throw new Error("Database url is not present in .env");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: "__drizzle_migration",
    schema: "public",
  },
  verbose: true,
  strict: true,
});
