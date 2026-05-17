import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const migrationsDir = resolve(process.cwd(), "supabase/migrations");
const errors = [];

if (!existsSync(migrationsDir)) {
  console.error("supabase/migrations directory does not exist.");
  process.exit(1);
}

const files = readdirSync(migrationsDir).filter((file) => file.endsWith(".sql"));
const sortedFiles = [...files].sort();
const timestamps = new Set();

for (const file of files) {
  const match = file.match(/^(\d{14})_[a-z0-9_]+\.sql$/);

  if (!match) {
    errors.push(`${file} must match YYYYMMDDHHMMSS_snake_case_name.sql.`);
    continue;
  }

  const timestamp = match[1];

  if (timestamps.has(timestamp)) {
    errors.push(`${file} reuses migration timestamp ${timestamp}.`);
  }

  timestamps.add(timestamp);
}

for (let index = 0; index < files.length; index += 1) {
  if (files[index] !== sortedFiles[index]) {
    errors.push("Migration files are not returned in lexicographic timestamp order.");
    break;
  }
}

if (errors.length > 0) {
  console.error(`Migration file check failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Migration file check passed for ${files.length} migrations.`);
