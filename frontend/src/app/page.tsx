import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            CS183 Project Demo
          </p>

          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            SocialCOMPACT Survivor Web Demo
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            A web-based visualization demo for the SocialCOMPACT Survivor game.
            This project helps users observe multi-agent communication,
            prediction, and decision-making in an interactive web interface.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/start"
              className="rounded-full bg-cyan-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start Match
            </Link>

            <Link
              href="/results"
              className="rounded-full border border-slate-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-slate-400 hover:bg-slate-900"
            >
              View Results
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-cyan-300">Communicate</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Agents first talk to each other and exchange strategic
              information before making decisions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-cyan-300">Predict</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Each agent predicts what other agents may do in the next round.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-cyan-300">Act</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Agents finally choose actions in the Survivor game and the web
              page visualizes the results round by round.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
