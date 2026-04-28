import Link from "next/link";
import { getServerApiBaseUrl } from "@/lib/api";
import type { MatchResult } from "@/lib/types";
import { PlayerCardGrid } from "@/components/player-card-grid";
import type { RoundDetailData, RoundEventType } from "@/components/round-detail";
import { ResultSummaryHero } from "@/components/result-summary-hero";
import { ResultSummaryHighlights } from "@/components/result-summary-highlights";
import {
  buildDemoFallback,
  buildResultPresentation,
  normalizeMatchResult,
} from "@/components/result-summary-model";
import { RoundTimeline } from "@/components/round-timeline";
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
      return matchId === "mock-match-001" ? buildDemoFallback(matchId) : null;
    }

    const payload = (await response.json()) as Partial<MatchResult> &
      Pick<
        MatchResult,
        "match_id" | "game" | "rounds" | "winner" | "players" | "summary"
      >;

    return normalizeMatchResult(payload);
  } catch {
    return matchId === "mock-match-001" ? buildDemoFallback(matchId) : null;
  }
}

function classifyRoundEvent(event: string): RoundEventType {
  const lowerEvent = event.toLowerCase();

  if (
    lowerEvent.includes("eliminated") ||
    lowerEvent.includes("removed") ||
    lowerEvent.includes("out") ||
    lowerEvent.includes("淘汰")
  ) {
    return "elimination";
  }

  if (
    lowerEvent.includes("voted") ||
    lowerEvent.includes("vote") ||
    lowerEvent.includes("投票")
  ) {
    return "vote";
  }

  if (
    lowerEvent.includes("remaining") ||
    lowerEvent.includes("survive") ||
    lowerEvent.includes("status") ||
    lowerEvent.includes("score") ||
    lowerEvent.includes("剩余")
  ) {
    return "status";
  }

  return "event";
}

function convertRoundLogsToDetails(
  roundLogs: MatchResult["round_logs"]
): RoundDetailData[] {
  return roundLogs.map((round) => ({
    id: round.round,
    events: round.events.map((event) => ({
      text: event,
      type: classifyRoundEvent(event),
    })),
    remainingPlayers: round.remaining_players,
    chats: [],
    predictions: [],
    actions: round.events
      .filter((event) => {
        const eventType = classifyRoundEvent(event);
        return eventType === "elimination" || eventType === "vote";
      })
      .map((event) => ({
        player: `Round ${round.round}`,
        action: event,
      })),
    observations: [
      ...round.events.map((event, index) => ({
        label: `Event ${index + 1}`,
        value: event,
      })),
      {
        label: "Remaining Players",
        value:
          round.remaining_players.length > 0
            ? round.remaining_players.join(", ")
            : "No remaining players recorded.",
      },
    ],
  }));
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = (await searchParams) ?? {};
  const matchId = getSingleValue(params.matchId, "mock-match-001");
  const result = await getMatchResult(matchId);

  if (!result) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
        <section className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
          <div className="rounded-[32px] border border-rose-300/20 bg-[linear-gradient(145deg,rgba(190,24,93,0.18),rgba(17,24,39,0.88))] p-8 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-100">
              Result Feed Missing
            </p>
            <h1 className="mt-4 text-4xl font-black">Result Not Available</h1>
            <p className="mt-4 leading-7 text-rose-50/90">
              The frontend could not load match{" "}
              <span className="font-mono">{matchId}</span>. Start the FastAPI
              backend or open the default demo result without a custom{" "}
              <span className="font-mono">matchId</span>.
            </p>
            <Link
              href="/start"
              className="mt-8 inline-block rounded-full bg-[linear-gradient(135deg,#fb7185,#f97316)] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Back To Start
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const presentation = buildResultPresentation(result);
  const isRunning = result.status === "running";
  const roundDetails = convertRoundLogsToDetails(result.round_logs);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(250,204,21,0.12),transparent_18%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:72px_72px] opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_60%)] blur-3xl" />

      <ResultsAutoRefresh enabled={isRunning} />

      <section className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
              SocialCOMPACT Results Overview
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Winner, score, player state cards, and match overview in one page.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-100">
              Game {result.game}
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-100">
              Match {result.match_id}
            </span>
            {isRunning ? (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                Auto Refresh On
              </span>
            ) : (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Final Snapshot
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <ResultSummaryHero
            result={result}
            winner={presentation.winner}
            activePlayers={presentation.stats.activePlayers}
            eliminatedPlayers={presentation.stats.eliminatedPlayers}
          />

          <ResultSummaryHighlights result={result} stats={presentation.stats} />

          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
            <PlayerCardGrid players={presentation.players} />
            <RoundTimeline rounds={roundDetails} />
          </div>
        </div>
      </section>
    </main>
  );
}
