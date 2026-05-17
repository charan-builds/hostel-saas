import process from "node:process";

import { validateIntegrationEnv } from "../tests/integration/helpers/env.mjs";

try {
  const env = validateIntegrationEnv();
  const url = new URL(env.supabaseUrl);

  console.log(
    [
      "Supabase integration env verification passed.",
      `target=${env.target}`,
      `host=${url.hostname}`,
      `projectRef=${env.projectRef ? "set" : "not-set"}`,
    ].join(" "),
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
