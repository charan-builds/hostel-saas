type SecurityHeader = {
  key: string;
  value: string;
};

type CspMode = "enforce" | "off" | "report-only";

const isProduction = process.env.NODE_ENV === "production";

function parseCspMode(value: string | undefined): CspMode {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "enforce" || normalized === "off") {
    return normalized;
  }

  return "report-only";
}

function normalizeUrl(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).toString();
  } catch {
    return undefined;
  }
}

function originFromUrl(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function directiveValues(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueDirectiveValues(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  );
}

function buildContentSecurityPolicy() {
  const supabaseOrigin = originFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseRealtimeOrigin = supabaseOrigin?.replace(/^https:/, "wss:");
  const cspReportUri = normalizeUrl(process.env.SECURITY_HEADERS_CSP_REPORT_URI);

  const directives: Record<string, string[]> = {
    "base-uri": ["'self'"],
    "connect-src": uniqueDirectiveValues([
      "'self'",
      supabaseOrigin,
      supabaseRealtimeOrigin,
      ...directiveValues(process.env.SECURITY_HEADERS_CSP_EXTRA_CONNECT_SRC),
      isProduction ? undefined : "http://localhost:*",
      isProduction ? undefined : "ws://localhost:*",
      isProduction ? undefined : "http://127.0.0.1:*",
      isProduction ? undefined : "ws://127.0.0.1:*",
    ]),
    "default-src": ["'self'"],
    "font-src": uniqueDirectiveValues([
      "'self'",
      "data:",
      ...directiveValues(process.env.SECURITY_HEADERS_CSP_EXTRA_FONT_SRC),
    ]),
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "frame-src": uniqueDirectiveValues([
      "'self'",
      ...directiveValues(process.env.SECURITY_HEADERS_CSP_EXTRA_FRAME_SRC),
    ]),
    "img-src": uniqueDirectiveValues([
      "'self'",
      "data:",
      "blob:",
      "https:",
      ...directiveValues(process.env.SECURITY_HEADERS_CSP_EXTRA_IMG_SRC),
    ]),
    "manifest-src": ["'self'"],
    "media-src": ["'self'", "data:", "blob:", "https:"],
    "object-src": ["'none'"],
    // Next.js App Router without a nonce/SRI policy still needs inline runtime
    // scripts/styles. Keep CSP report-only by default, then enforce after
    // production violation reports are clean.
    "script-src": uniqueDirectiveValues([
      "'self'",
      "'unsafe-inline'",
      ...directiveValues(process.env.SECURITY_HEADERS_CSP_EXTRA_SCRIPT_SRC),
      isProduction ? undefined : "'unsafe-eval'",
    ]),
    "style-src": uniqueDirectiveValues([
      "'self'",
      "'unsafe-inline'",
      ...directiveValues(process.env.SECURITY_HEADERS_CSP_EXTRA_STYLE_SRC),
    ]),
    "worker-src": ["'self'", "blob:"],
  };

  if (isProduction) {
    directives["upgrade-insecure-requests"] = [];
  }

  if (cspReportUri) {
    directives["report-uri"] = [cspReportUri];
  }

  return Object.entries(directives)
    .map(([directive, values]) =>
      values.length > 0 ? `${directive} ${values.join(" ")}` : directive,
    )
    .join("; ");
}

export function getSecurityHeaders(): SecurityHeader[] {
  const cspMode = parseCspMode(process.env.SECURITY_HEADERS_CSP_MODE);
  const headers: SecurityHeader[] = [
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value:
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()",
    },
    {
      // Safer for Supabase/OAuth/payment popups than full `same-origin`.
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin-allow-popups",
    },
    {
      key: "Cross-Origin-Resource-Policy",
      value: "same-origin",
    },
  ];

  if (isProduction) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  if (cspMode !== "off") {
    headers.push({
      key:
        cspMode === "enforce"
          ? "Content-Security-Policy"
          : "Content-Security-Policy-Report-Only",
      value: buildContentSecurityPolicy(),
    });
  }

  return headers;
}

export function applySecurityHeaders(headers: Headers) {
  getSecurityHeaders().forEach(({ key, value }) => {
    headers.set(key, value);
  });
}
