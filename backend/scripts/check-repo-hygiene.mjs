import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import process from "node:process";

const root =
  basename(process.cwd()) === "backend"
    ? resolve(process.cwd(), "..")
    : process.cwd();
const ignoredSegments = new Set([
  ".git",
  ".next",
  ".temp",
  "node_modules",
  "coverage",
  "dist",
  "build",
]);
const ignoredFiles = new Set([".env.local"]);
const blockedArtifactPatterns = [/\.tar\.gz$/i, /\.zip$/i];
const generatedArtifactPatterns = [/\.tsbuildinfo$/i];
const secretPatterns = [
  {
    name: "Supabase server secret",
    regex: /sb_secret_(?!your|placeholder|replace)[A-Za-z0-9_-]{16,}/g,
  },
  {
    name: "Supabase publishable key",
    regex: /sb_publishable_(?!your|placeholder|replace|test)[A-Za-z0-9_-]{16,}/g,
  },
  {
    name: "Supabase personal access token",
    regex: /sbp_(?!your|placeholder|replace)[A-Za-z0-9_-]{20,}/g,
  },
  {
    name: "JWT-like token",
    regex: /eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}/g,
  },
];

const errors = [];
const warnings = [];

function shouldSkipPath(path) {
  const segments = relative(root, path).split(/[\\/]/);

  return segments.some((segment) => ignoredSegments.has(segment));
}

function scanDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    const repoPath = relative(root, fullPath) || ".";

    if (entry.isDirectory()) {
      if (entry.name === ".git" && repoPath !== ".git") {
        warnings.push(`Nested git metadata found at ${repoPath}. Remove only after confirming history is preserved.`);
        continue;
      }

      if (shouldSkipPath(fullPath)) {
        continue;
      }

      scanDirectory(fullPath);
      continue;
    }

    if (!entry.isFile() || ignoredFiles.has(entry.name) || shouldSkipPath(fullPath)) {
      continue;
    }

    if (blockedArtifactPatterns.some((pattern) => pattern.test(entry.name))) {
      errors.push(`Disposable/generated artifact found: ${repoPath}`);
      continue;
    }

    if (generatedArtifactPatterns.some((pattern) => pattern.test(entry.name))) {
      warnings.push(`Generated local artifact found: ${repoPath}. It is ignored and can be deleted.`);
      continue;
    }

    const stats = statSync(fullPath);

    if (stats.size > 2 * 1024 * 1024) {
      warnings.push(`Large file found: ${repoPath} (${Math.ceil(stats.size / 1024 / 1024)} MB).`);
    }

    if (stats.size > 1024 * 1024) {
      continue;
    }

  }
}

function scanSecrets(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    const repoPath = relative(root, fullPath) || ".";

    if (entry.isDirectory()) {
      if (shouldSkipPath(fullPath) || entry.name === ".git") {
        continue;
      }

      scanSecrets(fullPath);
      continue;
    }

    if (!entry.isFile() || ignoredFiles.has(entry.name) || shouldSkipPath(fullPath)) {
      continue;
    }

    const stats = statSync(fullPath);

    if (stats.size > 1024 * 1024) {
      continue;
    }

    const text = readFileSync(fullPath, "utf8");

    for (const pattern of secretPatterns) {
      pattern.regex.lastIndex = 0;

      if (pattern.regex.test(text)) {
        errors.push(`${pattern.name} candidate found in ${repoPath}. Replace with a placeholder or rotate if exposed.`);
      }
    }
  }
}

scanDirectory(root);
scanSecrets(root);

if (warnings.length > 0) {
  console.warn(`Repository hygiene warnings:\n- ${warnings.join("\n- ")}`);
}

if (errors.length > 0) {
  console.error(`Repository hygiene check failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Repository hygiene check passed.");
