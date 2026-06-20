import { loginToConsole } from "../actions";

export const dynamic = "force-dynamic";

export default function ConsoleLogin({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form
        action={loginToConsole}
        className="w-full max-w-sm rounded-lg bg-paper p-8 shadow-2xl"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
          Driveway Advocate
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink">
          Review console
        </h1>
        <p className="mt-1 text-[13px] text-slate">Team access only.</p>

        <input type="hidden" name="next" value={searchParams?.next ?? "/console"} />

        {searchParams?.error && (
          <p className="mt-4 rounded border-l-4 border-risk bg-risk/5 px-3 py-2 text-[13px] text-risk">
            Incorrect password.
          </p>
        )}

        <label className="mt-5 block">
          <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate">
            Password
          </span>
          <input
            name="password"
            type="password"
            autoFocus
            className="w-full rounded border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-gold"
          />
        </label>

        <button
          type="submit"
          className="mt-5 w-full rounded bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-ink-soft"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
