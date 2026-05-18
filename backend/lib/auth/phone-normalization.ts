import "server-only";

import { serverEnv } from "@/lib/config/server-env";
import { AppError } from "@/lib/http/errors";

export type NormalizedPhone = {
  e164: string;
  localDigits: string;
  searchCandidates: string[];
};

function normalizeCountryCode(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits ? `+${digits}` : "+91";
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function normalizePhoneForAuth(value: string | null | undefined): NormalizedPhone {
  const raw = value?.trim();

  if (!raw) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Phone number is required.",
      statusCode: 422,
    });
  }

  const defaultCountryCode = normalizeCountryCode(
    serverEnv.AUTH_DEFAULT_PHONE_COUNTRY_CODE,
  );
  const compact = raw.replace(/[\s().-]/g, "");
  const international =
    compact.startsWith("+")
      ? compact
      : compact.startsWith("00")
        ? `+${compact.slice(2)}`
        : `${defaultCountryCode}${compact.replace(/\D/g, "")}`;
  const e164 = `+${international.replace(/\D/g, "")}`;
  const digits = e164.slice(1);
  const localDigits = digits.length > 10 ? digits.slice(-10) : digits;

  if (digits.length < 8 || digits.length > 15) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Phone number must be a valid international number.",
      statusCode: 422,
    });
  }

  return {
    e164,
    localDigits,
    searchCandidates: unique([e164, digits, localDigits, raw]),
  };
}
