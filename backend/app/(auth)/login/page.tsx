import { redirect } from "next/navigation";

import { getOptionalIdentity } from "@/lib/auth/session";
import { signInWithPasswordAction } from "@/modules/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const identity = await getOptionalIdentity();
  const params = await searchParams;

  if (identity) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-950">
      <form
        action={signInWithPasswordAction}
        className="w-full max-w-sm space-y-5 rounded bg-white p-6 shadow-lg"
      >
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h1 className="text-2xl font-semibold">Sign in</h1>
        </div>
        {params.error ? (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Invalid email or password.
          </p>
        ) : null}
        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Password</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        <button
          className="w-full rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
          type="submit"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
