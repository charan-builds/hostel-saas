const LOCALHOST_NAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

type OriginAllowlistOptions = {
  env?: NodeJS.ProcessEnv | undefined;
  requestUrlOrigin?: string | undefined;
};

function isProduction(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV === "production";
}

export function normalizeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

function uniqueOrigins(values: Array<string | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export function parseAllowedOrigins(value: string | undefined) {
  return uniqueOrigins(
    (value ?? "")
      .split(",")
      .map((origin) => normalizeOrigin(origin)),
  );
}

export function getConfiguredAllowedOrigins(env: NodeJS.ProcessEnv = process.env) {
  return uniqueOrigins([
    normalizeOrigin(env.NEXT_PUBLIC_APP_URL),
    ...parseAllowedOrigins(env.ALLOWED_ORIGINS),
  ]);
}

export function getAllowedOriginsForRequest({
  env = process.env,
  requestUrlOrigin,
}: OriginAllowlistOptions = {}) {
  const configuredOrigins = getConfiguredAllowedOrigins(env);

  if (isProduction(env)) {
    return configuredOrigins;
  }

  return uniqueOrigins([
    ...configuredOrigins,
    normalizeOrigin(requestUrlOrigin),
  ]);
}

export function isLocalDevelopmentOrigin(origin: string) {
  const normalized = normalizeOrigin(origin);

  if (!normalized) {
    return false;
  }

  const { hostname, protocol } = new URL(normalized);

  return (
    (protocol === "http:" || protocol === "https:") &&
    (LOCALHOST_NAMES.has(hostname) || hostname.endsWith(".localhost"))
  );
}

export function isAllowedRequestOrigin(
  origin: string,
  {
    env = process.env,
    requestUrlOrigin,
  }: OriginAllowlistOptions = {},
) {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) {
    return false;
  }

  if (getConfiguredAllowedOrigins(env).includes(normalizedOrigin)) {
    return true;
  }

  if (isProduction(env)) {
    return false;
  }

  return (
    normalizeOrigin(requestUrlOrigin) === normalizedOrigin ||
    isLocalDevelopmentOrigin(normalizedOrigin)
  );
}

