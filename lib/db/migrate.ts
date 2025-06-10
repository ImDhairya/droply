import {drizzle} from "drizzle-orm/neon-http";
import {migrate} from "drizzle-orm/neon-http/migrator";
import {neon} from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Database  variables are not set, please set env variables   .env.local"
  );
}

async function runMigration() {
  console.log("🔄 Starting database migration...");

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    await migrate(db, {migrationsFolder: "./drizzle"});
    console.log("All migrations are successfully done.");
  } catch (error) {
    console.log(error)
    console.log("Failed to create migrations.");
    process.exit(1);
  }
}

runMigration();
