export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md rounded border border-border bg-card p-6 text-center text-card-foreground">
        <p className="text-sm font-medium text-muted-foreground">Access denied</p>
        <h1 className="mt-2 text-2xl font-semibold">
          You do not have access to this workspace.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Contact an organization admin if you believe your tenant membership
          or role needs to be updated.
        </p>
      </section>
    </main>
  );
}
