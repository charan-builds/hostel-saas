import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getOptionalIdentity } from "@/lib/auth/session";
import {
  requestStudentPhoneOtpAction,
  verifyStudentPhoneOtpAction,
} from "@/modules/auth/actions";

type StudentLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    phone?: string;
    sent?: string;
  }>;
};

function getSafeNextPath(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

export default async function StudentLoginPage({
  searchParams,
}: StudentLoginPageProps) {
  const identity = await getOptionalIdentity();
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const otpSent = params.sent === "1";
  const phone = params.phone ?? "";

  if (identity) {
    redirect((nextPath ?? "/student-portal") as Route);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-950">
      <section className="w-full max-w-sm space-y-4 rounded bg-white p-6 shadow-lg">
        <div>
          <p className="text-sm font-medium text-slate-500">Student portal</p>
          <h1 className="text-2xl font-semibold">Sign in with OTP</h1>
          <p className="mt-2 text-sm text-slate-600">
            Use the phone number registered with your hostel.
          </p>
        </div>

        {params.error ? (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            We could not complete that OTP step. Check the number and code, then retry.
          </p>
        ) : null}

        <form action={requestStudentPhoneOtpAction} className="space-y-4">
          {nextPath ? <input name="redirectTo" type="hidden" value={nextPath} /> : null}
          <label className="block space-y-1">
            <span className="text-sm font-medium">Phone number</span>
            <input
              autoComplete="tel"
              className="w-full rounded border border-slate-300 px-3 py-2"
              defaultValue={phone}
              name="phone"
              placeholder="+919876543210"
              required
              type="tel"
            />
          </label>
          <button
            className="w-full rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            {otpSent ? "Send OTP again" : "Send OTP"}
          </button>
        </form>

        {otpSent ? (
          <form action={verifyStudentPhoneOtpAction} className="space-y-4">
            {nextPath ? (
              <input name="redirectTo" type="hidden" value={nextPath} />
            ) : null}
            <input name="phone" type="hidden" value={phone} />
            <label className="block space-y-1">
              <span className="text-sm font-medium">OTP code</span>
              <input
                autoComplete="one-time-code"
                className="w-full rounded border border-slate-300 px-3 py-2"
                inputMode="numeric"
                maxLength={8}
                minLength={6}
                name="token"
                pattern="[0-9]*"
                required
              />
            </label>
            <button
              className="w-full rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
              type="submit"
            >
              Verify and open portal
            </button>
          </form>
        ) : null}

        <p className="text-center text-sm text-slate-600">
          Admin user?{" "}
          <Link className="font-medium text-slate-950 underline" href="/login">
            Sign in with email
          </Link>
        </p>
      </section>
    </main>
  );
}
