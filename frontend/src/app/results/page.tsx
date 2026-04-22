import Link from "next/link";
type SearchParamValue = string | string[] | undefined;

type ResultsPageProps = {
  searchParams?: Promise<{
    game?: SearchParamValue;
    players?: SearchParamValue;
    rounds?: SearchParamValue;
  }>;
};

function getSingleValue(value: SearchParamValue, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {
  const params = (await searchParams) ?? {};
  const game = getSingleValue(params.game, "Survivor");
  const players = getSingleValue(params.players, "6");
  const rounds = getSingleValue(params.rounds, "10");

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="rounded-[32px] border border-white/10 bg-white/6 p-8 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Temporary Results
          </p>

          <h1 className="mt-4 text-4xl font-bold">Match Started Successfully</h1>

          <p className="mt-4 text-slate-300">
            This is a placeholder results page for the current frontend demo.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Game</p>
              <p className="mt-2 text-2xl font-bold">{game}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Players</p>
              <p className="mt-2 text-2xl font-bold">{players}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Max Rounds</p>
              <p className="mt-2 text-2xl font-bold">{rounds}</p>
            </div>
          </div>

          <Link
            href="/start"
            className="mt-8 inline-block rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Start Another Match
          </Link>
        </div>
      </section>
    </main>
  );
}
