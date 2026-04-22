"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function StartPage() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState("6");
  const [maxRounds, setMaxRounds] = useState("10");
  const [status, setStatus] = useState(
    "Fill in the settings and click Start Match."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const players = Number(playerCount);
    const rounds = Number(maxRounds);

    if (!Number.isInteger(players) || players < 2) {
      setStatus("Player count must be an integer of at least 2.");
      return;
    }

    if (!Number.isInteger(rounds) || rounds < 1) {
      setStatus("Max rounds must be an integer of at least 1.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Starting match...");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    router.push(`/results?game=Survivor&players=${players}&rounds=${rounds}`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Match Setup
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Configure the Survivor match and launch the demo flow.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Back Home
          </Link>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Survivor
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              Start Survivor Match
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Fill in the match settings below. This version uses fake loading
              and then jumps to the results page for demo purposes.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-cyan-300">
                  Current Goal
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Show a working form, loading feedback, and page redirect.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-cyan-300">
                  Backend Status
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Real API can be connected later after the frontend flow works.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/7 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
                Match Form
              </p>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Game Name
                  </label>
                  <input
                    value="Survivor"
                    disabled
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Player Count
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={playerCount}
                    onChange={(e) => setPlayerCount(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Max Rounds
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxRounds}
                    onChange={(e) => setMaxRounds(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Starting..." : "Start Match"}
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  {status}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
