import { z } from "zod";

const safeRedirectPathSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .trim()
    .max(512)
    .refine(
      (value) => value.startsWith("/") && !value.startsWith("//"),
      "Redirect path must be an internal path.",
    )
    .optional(),
);

export const signInWithPasswordSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(256),
  redirectTo: safeRedirectPathSchema,
});

export const studentPhoneOtpRequestSchema = z.object({
  phone: z.string().trim().min(8).max(32),
  redirectTo: safeRedirectPathSchema,
  requestId: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(8).max(160).optional(),
  ),
});

export const studentPhoneOtpVerifySchema = studentPhoneOtpRequestSchema.extend({
  token: z.string().trim().regex(/^\d{6,8}$/, "OTP must be a valid numeric code."),
});

export type StudentPhoneOtpRequestInput = z.output<
  typeof studentPhoneOtpRequestSchema
>;
export type StudentPhoneOtpVerifyInput = z.output<
  typeof studentPhoneOtpVerifySchema
>;
