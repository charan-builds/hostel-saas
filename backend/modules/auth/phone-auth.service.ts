import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { recordAuditEvent } from "@/lib/audit/log";
import { normalizePhoneForAuth, type NormalizedPhone } from "@/lib/auth/phone-normalization";
import { AppError } from "@/lib/http/errors";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setActiveTenantCookie } from "@/lib/tenancy/active-tenant";
import type { Json } from "@/types/database.types";
import type {
  StudentPhoneOtpRequestInput,
  StudentPhoneOtpVerifyInput,
} from "@/modules/auth/schemas";

type StudentAuthRow = {
  email: string | null;
  first_name: string;
  hostel_branch_id: string;
  id: string;
  last_name: string;
  metadata: Json;
  organization_id: string;
  phone: string | null;
  status: string;
  student_code: string;
  user_profile_id: string | null;
};

type UserProfileRow = {
  id: string;
  metadata: Json;
  role: "admin" | "student" | "superadmin";
};

const STUDENT_AUTH_SELECT =
  "id,organization_id,hostel_branch_id,user_profile_id,student_code,first_name,last_name,email,phone,status,metadata";

function toJsonObject(value: Json): { [key: string]: Json | undefined } {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return {};
}

function safeStudentEmail(studentId: string) {
  return `student-${studentId}@students.hostel-erp.local`;
}

function fullName(student: StudentAuthRow) {
  return [student.first_name, student.last_name].filter(Boolean).join(" ");
}

function hashPhone(phone: string) {
  return createHash("sha256").update(phone).digest("hex").slice(0, 32);
}

async function enforcePhoneAttemptLimit(options: {
  limit: number;
  phone: NormalizedPhone;
  prefix: string;
  windowMs: number;
}) {
  const decision = await checkRateLimit({
    key: `${options.prefix}:${hashPhone(options.phone.e164)}`,
    limit: options.limit,
    windowMs: options.windowMs,
  });

  if (!decision.allowed) {
    throw new AppError({
      code: "RATE_LIMITED",
      details: {
        retryAfterSeconds: decision.retryAfterSeconds,
      },
      message: "Too many OTP attempts. Please retry shortly.",
      statusCode: 429,
    });
  }
}

async function resolveStudentByPhone(phone: NormalizedPhone) {
  const supabase = createSupabaseAdminClient();
  const { data: metadataMatches, error: metadataError } = await supabase
    .from("students")
    .select(STUDENT_AUTH_SELECT)
    .eq("metadata->>auth_phone_e164", phone.e164)
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(3);

  if (metadataError) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to resolve student phone login.",
      statusCode: 500,
      expose: false,
    });
  }

  const matchesById = new Map<string, StudentAuthRow>();

  for (const student of (metadataMatches ?? []) as StudentAuthRow[]) {
    matchesById.set(student.id, student);
  }

  if (matchesById.size === 0) {
    const { data: phoneMatches, error: phoneError } = await supabase
      .from("students")
      .select(STUDENT_AUTH_SELECT)
      .in("phone", phone.searchCandidates)
      .eq("status", "active")
      .is("deleted_at", null)
      .limit(3);

    if (phoneError) {
      throw new AppError({
        code: "INTERNAL_ERROR",
        message: "Unable to resolve student phone login.",
        statusCode: 500,
        expose: false,
      });
    }

    for (const student of (phoneMatches ?? []) as StudentAuthRow[]) {
      matchesById.set(student.id, student);
    }
  }

  const matches = Array.from(matchesById.values());

  if (matches.length > 1) {
    throw new AppError({
      code: "CONFLICT",
      message:
        "This phone number is linked to more than one active student. Please contact the hostel admin.",
      statusCode: 409,
    });
  }

  return matches[0];
}

async function getUserProfile(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id,role,metadata")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to load user profile for student login.",
      statusCode: 500,
      expose: false,
    });
  }

  return data as UserProfileRow | null;
}

async function ensureStudentProfile(options: {
  phone: NormalizedPhone;
  requestId: string;
  student: StudentAuthRow;
  userId: string;
}) {
  const supabase = createSupabaseAdminClient();
  const existingProfile = await getUserProfile(options.userId);
  const profileMetadata = {
    ...toJsonObject(existingProfile?.metadata ?? {}),
    auth_phone_e164: options.phone.e164,
    auth_provider: "phone_otp",
    student_id: options.student.id,
  };

  if (!existingProfile) {
    const { error } = await supabase.from("user_profiles").insert({
      email: safeStudentEmail(options.student.id),
      full_name: fullName(options.student),
      hostel_branch_id: options.student.hostel_branch_id,
      id: options.userId,
      is_active: true,
      metadata: profileMetadata,
      organization_id: options.student.organization_id,
      phone: options.phone.e164,
      role: "student",
    });

    if (error) {
      throw new AppError({
        code: "INTERNAL_ERROR",
        message: "Unable to create student user profile.",
        statusCode: 500,
        expose: false,
      });
    }

    return;
  }

  const profileUpdate =
    existingProfile.role === "student"
      ? {
          full_name: fullName(options.student),
          hostel_branch_id: options.student.hostel_branch_id,
          is_active: true,
          metadata: profileMetadata,
          organization_id: options.student.organization_id,
          phone: options.phone.e164,
        }
      : {
          metadata: profileMetadata,
          phone: options.phone.e164,
        };
  const { error } = await supabase
    .from("user_profiles")
    .update(profileUpdate)
    .eq("id", options.userId);

  if (error) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to update student user profile.",
      statusCode: 500,
      expose: false,
    });
  }
}

async function ensureStudentMembership(options: {
  phone: NormalizedPhone;
  student: StudentAuthRow;
  userId: string;
}) {
  const supabase = createSupabaseAdminClient();
  const scope = {
    auth_phone_e164: options.phone.e164,
    student_id: options.student.id,
  };
  const { data: existing, error: existingError } = await supabase
    .from("tenant_memberships")
    .select("id")
    .eq("user_id", options.userId)
    .eq("organization_id", options.student.organization_id)
    .eq("hostel_branch_id", options.student.hostel_branch_id)
    .eq("app", "hostel_erp")
    .is("deleted_at", null)
    .maybeSingle();

  if (existingError) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to load student tenant membership.",
      statusCode: 500,
      expose: false,
    });
  }

  if (existing) {
    const { error } = await supabase
      .from("tenant_memberships")
      .update({
        accepted_at: new Date().toISOString(),
        role: "student",
        scope,
        status: "active",
        updated_by: options.userId,
      })
      .eq("id", existing.id);

    if (error) {
      throw new AppError({
        code: "INTERNAL_ERROR",
        message: "Unable to update student tenant membership.",
        statusCode: 500,
        expose: false,
      });
    }

    return;
  }

  const { error } = await supabase.from("tenant_memberships").insert({
    accepted_at: new Date().toISOString(),
    app: "hostel_erp",
    created_by: options.userId,
    hostel_branch_id: options.student.hostel_branch_id,
    organization_id: options.student.organization_id,
    role: "student",
    scope,
    status: "active",
    updated_by: options.userId,
    user_id: options.userId,
  });

  if (error) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to create student tenant membership.",
      statusCode: 500,
      expose: false,
    });
  }
}

async function linkStudentToUser(options: {
  phone: NormalizedPhone;
  student: StudentAuthRow;
  userId: string;
}) {
  if (
    options.student.user_profile_id &&
    options.student.user_profile_id !== options.userId
  ) {
    throw new AppError({
      code: "CONFLICT",
      message: "This student account is already linked. Please contact the hostel admin.",
      statusCode: 409,
    });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("students")
    .update({
      metadata: {
        ...toJsonObject(options.student.metadata),
        auth_phone_e164: options.phone.e164,
      },
      phone: options.phone.e164,
      user_profile_id: options.userId,
      updated_by: options.userId,
    })
    .eq("id", options.student.id)
    .eq("organization_id", options.student.organization_id)
    .eq("hostel_branch_id", options.student.hostel_branch_id)
    .is("deleted_at", null);

  if (error) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to link student account.",
      statusCode: 500,
      expose: false,
    });
  }
}

async function finalizeStudentLogin(options: {
  phone: NormalizedPhone;
  requestId: string;
  student: StudentAuthRow;
  userId: string;
}) {
  await ensureStudentProfile(options);
  await ensureStudentMembership(options);
  await linkStudentToUser(options);
  await setActiveTenantCookie({
    organizationId: options.student.organization_id,
    product: "hostel_erp",
  });

  await recordAuditEvent({
    action: "auth.student_phone_otp.verify",
    actorUserId: options.userId,
    durable: true,
    entityId: options.student.id,
    entityTable: "students",
    hostelBranchId: options.student.hostel_branch_id,
    metadata: {
      auth_provider: "phone_otp",
      phone_hash: hashPhone(options.phone.e164),
      student_code: options.student.student_code,
    },
    organizationId: options.student.organization_id,
    requestId: options.requestId,
  });
}

export async function sendStudentPhoneOtp(input: StudentPhoneOtpRequestInput) {
  const requestId = input.requestId ?? randomUUID();
  const phone = normalizePhoneForAuth(input.phone);

  await enforcePhoneAttemptLimit({
    limit: 3,
    phone,
    prefix: "student-auth:send",
    windowMs: 10 * 60_000,
  });

  const student = await resolveStudentByPhone(phone);

  if (!student) {
    await recordAuditEvent({
      action: "auth.student_phone_otp.request_unknown",
      metadata: {
        phone_hash: hashPhone(phone.e164),
      },
      requestId,
    });

    return {
      phone: phone.e164,
      sent: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: phone.e164,
  });

  if (error) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "Unable to send OTP. Please retry shortly.",
      statusCode: 400,
    });
  }

  await recordAuditEvent({
    action: "auth.student_phone_otp.request",
    durable: true,
    entityId: student.id,
    entityTable: "students",
    hostelBranchId: student.hostel_branch_id,
    metadata: {
      phone_hash: hashPhone(phone.e164),
      student_code: student.student_code,
    },
    organizationId: student.organization_id,
    requestId,
  });

  return {
    phone: phone.e164,
    sent: true,
  };
}

export async function verifyStudentPhoneOtp(input: StudentPhoneOtpVerifyInput) {
  const requestId = input.requestId ?? randomUUID();
  const phone = normalizePhoneForAuth(input.phone);

  await enforcePhoneAttemptLimit({
    limit: 10,
    phone,
    prefix: "student-auth:verify",
    windowMs: 10 * 60_000,
  });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phone.e164,
    token: input.token,
    type: "sms",
  });

  if (error || !data.user) {
    await recordAuditEvent({
      action: "auth.student_phone_otp.verify_failed",
      metadata: {
        phone_hash: hashPhone(phone.e164),
      },
      requestId,
    });

    throw new AppError({
      code: "UNAUTHORIZED",
      message: "The OTP is invalid or expired.",
      statusCode: 401,
    });
  }

  const student = await resolveStudentByPhone(phone);

  if (!student) {
    await supabase.auth.signOut();

    throw new AppError({
      code: "FORBIDDEN",
      message: "No active student account is linked to this phone number.",
      statusCode: 403,
    });
  }

  await finalizeStudentLogin({
    phone,
    requestId,
    student,
    userId: data.user.id,
  });

  return {
    organizationId: student.organization_id,
    phone: phone.e164,
    redirectTo: input.redirectTo ?? "/student-portal",
    studentId: student.id,
    userId: data.user.id,
  };
}
