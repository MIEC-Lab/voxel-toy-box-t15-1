import type { GameLogEvent } from "@/lib/types";

type GameProcessLogProps = {
  events: GameLogEvent[];
  isPolling: boolean;
};

const phaseStyles: Record<string, string> = {
  system: "border-slate-300/20 bg-slate-300/10 text-slate-100",
  chat: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  reasoning: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  prediction: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  decision: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  observation: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
};

function phaseClassName(phase: string) {
  return phaseStyles[phase] ?? phaseStyles.system;
}

function formatPhase(phase: string) {
  return phase.replace(/_/g, " ").toUpperCase();
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function GameProcessLog({ events, isPolling }: GameProcessLogProps) {
  const visibleEvents = events.slice(-80);

  return (
    <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(8,47,73,0.72))] p-6 shadow-[0_22px_90px_rgba(8,145,178,0.12)] backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Live Game Process
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Agent Conversation & Decisions
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            The frontend polls the backend every 3 seconds and renders the
            newest Arena logs here.
          </p>
        </div>

        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
          {isPolling ? "Polling On" : "Final Logs"}
        </div>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-6 text-slate-300">
          No live process logs yet. If Arena mode is running, this section will
          update automatically as the backend receives stream artifacts.
        </div>
      ) : (
        <div className="mt-6 max-h-[34rem] space-y-3 overflow-y-auto pr-2">
          {visibleEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-white/10 bg-slate-950/42 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${phaseClassName(
                    event.phase
                  )}`}
                >
                  {formatPhase(event.phase)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Round {event.round}
                </span>
                {event.actor ? (
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                    {event.actor}
                    {event.target ? ` -> ${event.target}` : ""}
                  </span>
                ) : null}
                <span className="ml-auto font-mono text-xs text-slate-500">
                  {formatTime(event.timestamp)}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                {event.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
