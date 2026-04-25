import Link from "next/link";
import { getServerApiBaseUrl } from "@/lib/api";
import type { MatchResult } from "@/lib/types";
import { ResultsAutoRefresh } from "./results-auto-refresh";

export const dynamic = "force-dynamic";

type SearchParamValue = string | string[] | undefined;

type ResultsPageProps = {
  searchParams?: Promise<{
    matchId?: SearchParamValue;
  }>;
};

function getSingleValue(value: SearchParamValue, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

async function getMatchResult(matchId: string) {
  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}/api/results/${encodeURIComponent(matchId)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as MatchResult;
  } catch {
    return null;
  }
}

function badgeTone(source: string) {
  if (source === "arena") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }
  if (source === "local-fallback") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = (await searchParams) ?? {};
  const matchId = getSingleValue(params.matchId, "mock-match-001");
  const result = await getMatchResult(matchId);

  if (!result) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
        <section className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
          <div className="rounded-[32px] border border-rose-300/20 bg-rose-300/10 p-8 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-200">
              Backend Offline
            </p>
            <h1 className="mt-4 text-4xl font-bold">Result Not Available</h1>
            <p className="mt-4 leading-7 text-rose-100/90">
              The frontend could not load match <span className="font-mono">{matchId}</span>.
              Start the FastAPI backend and try again.
            </p>
            <Link
              href="/start"
              className="mt-8 inline-block rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Back To Start
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const sortedPlayers = [...result.players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name)
  );
  const isRunning = result.status === "running";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <ResultsAutoRefresh enabled={isRunning} />
      <section className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Match Results
            </p>
            <h1 className="mt-3 text-4xl font-bold">{result.game}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              {result.summary}
            </p>
            {isRunning ? (
              <p className="mt-3 text-sm font-semibold text-cyan-200">
                Waiting for Arena artifacts. This page refreshes every 3 seconds.
              </p>
            ) : null}
          </div>

          <Link
            href="/start"
            className="rounded-full bg-cyan-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Start Another Match
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Winner</p>
            <p className="mt-2 text-3xl font-bold">{result.winner}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Rounds</p>
            <p className="mt-2 text-3xl font-bold">{result.rounds}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Status</p>
            <p className="mt-2 text-3xl font-bold capitalize">{result.status}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Source</p>
            <span
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${badgeTone(
                result.source
              )}`}
            >
              {result.source}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <h2 className="text-2xl font-bold">Scoreboard</h2>
            <div className="mt-5 space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.name}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 p-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                      Rank {index + 1}
                    </p>
                    <p className="mt-1 text-lg font-semibold">{player.name}</p>
                    <p className="text-sm capitalize text-slate-400">
                      {player.status}
                    </p>
                  </div>
                  <p className="text-3xl font-bold">{player.score}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <h2 className="text-2xl font-bold">Round Timeline</h2>
            {result.round_logs.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">
                This result does not include detailed round logs yet.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {result.round_logs.map((round) => (
                  <article
                    key={round.round}
                    className="rounded-3xl border border-white/10 bg-slate-950/45 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold">
                        Round {round.round}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {round.remaining_players.length} remaining
                      </p>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
                      {round.events.map((event) => (
                        <li key={event} className="rounded-xl bg-white/5 px-3 py-2">
                          {event}
                        </li>
                      ))}
                    </ul>
                    {round.remaining_players.length > 0 ? (
                      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-300">
                        Remaining: {round.remaining_players.join(", ")}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
