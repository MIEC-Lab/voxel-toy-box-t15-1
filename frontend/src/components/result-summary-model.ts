import type { MatchResult } from "@/lib/types";

const ATTACK_EVENT_PATTERN = /^(.*?) attacks (.*?) for (\d+) damage\.$/;
const ELIMINATION_EVENT_PATTERN = /^(.*?) is eliminated\.$/;
const DISPLAY_MAX_HP = 6;
const MIN_AMMO_CAPACITY = 6;

type NormalizedStatus =
  | "winner"
  | "active"
  | "finished"
  | "eliminated"
  | "failed";

export type PlayerCardTone = "winner" | "active" | "eliminated" | "neutral";

export type PlayerCombatSnapshot = {
  name: string;
  score: number;
  status: string;
  statusLabel: string;
  rank: number;
  hp: number;
  maxHp: number;
  ammo: number;
  maxAmmo: number;
  shotsFired: number;
  damageDealt: number;
  damageTaken: number;
  eliminated: boolean;
  tone: PlayerCardTone;
  insight: string;
};

export type ResultPresentation = {
  winner: PlayerCombatSnapshot;
  players: PlayerCombatSnapshot[];
  stats: {
    activePlayers: number;
    eliminatedPlayers: number;
    totalEvents: number;
    playerCount: number;
    totalScore: number;
  };
};

type CombatTotals = {
  hp: number;
  shotsFired: number;
  damageDealt: number;
  damageTaken: number;
  eliminated: boolean;
};

export function normalizeMatchResult(
  result: Partial<MatchResult> &
    Pick<
      MatchResult,
      "match_id" | "game" | "rounds" | "winner" | "players" | "summary"
    >
): MatchResult {
  return {
    match_id: result.match_id,
    game: result.game,
    rounds: result.rounds,
    winner: result.winner,
    players: result.players ?? [],
    summary: result.summary,
    source: result.source ?? "sample-data",
    status: result.status ?? "completed",
    round_logs: result.round_logs ?? [],
  };
}

export function buildDemoFallback(matchId = "mock-match-001"): MatchResult {
  return {
    match_id: matchId,
    game: "Survivor",
    rounds: 4,
    winner: "Alice",
    players: [
      {
        name: "Alice",
        score: 14,
        status: "winner",
      },
      {
        name: "Benjamin",
        score: 11,
        status: "survived",
      },
      {
        name: "Chen",
        score: 7,
        status: "eliminated",
      },
      {
        name: "Devika",
        score: 5,
        status: "eliminated",
      },
    ],
    summary:
      "Alice controls the late-game pressure line, keeps the final zone stable, and closes the demo snapshot with the highest tactical score.",
    source: "demo-snapshot",
    status: "completed",
    round_logs: [
      {
        round: 1,
        events: [
          "Alice attacks Chen for 1 damage.",
          "Benjamin attacks Devika for 2 damage.",
          "Chen attacks Alice for 1 damage.",
          "Devika attacks Benjamin for 1 damage.",
        ],
        remaining_players: ["Alice", "Benjamin", "Chen", "Devika"],
      },
      {
        round: 2,
        events: [
          "Alice attacks Chen for 2 damage.",
          "Benjamin attacks Devika for 1 damage.",
          "Chen attacks Alice for 1 damage.",
          "Devika attacks Benjamin for 1 damage.",
        ],
        remaining_players: ["Alice", "Benjamin", "Chen", "Devika"],
      },
      {
        round: 3,
        events: [
          "Alice attacks Chen for 2 damage.",
          "Benjamin attacks Devika for 2 damage.",
          "Chen attacks Alice for 1 damage.",
          "Devika attacks Benjamin for 1 damage.",
        ],
        remaining_players: ["Alice", "Benjamin", "Chen", "Devika"],
      },
      {
        round: 4,
        events: [
          "Alice attacks Chen for 2 damage.",
          "Chen is eliminated.",
          "Benjamin attacks Devika for 1 damage.",
          "Devika is eliminated.",
          "Arena pressure seals the final scoreboard.",
        ],
        remaining_players: ["Alice", "Benjamin"],
      },
    ],
  };
}

export function buildResultPresentation(result: MatchResult): ResultPresentation {
  const players = [...result.players].sort(
    (left, right) => right.score - left.score || left.name.localeCompare(right.name)
  );
  const hasRoundLogs = result.round_logs.length > 0;
  const ammoCapacity = Math.max(result.rounds + 3, MIN_AMMO_CAPACITY);
  const totals = new Map<string, CombatTotals>(
    players.map((player) => [
      player.name,
      {
        hp: DISPLAY_MAX_HP,
        shotsFired: 0,
        damageDealt: 0,
        damageTaken: 0,
        eliminated: false,
      },
    ])
  );

  for (const round of result.round_logs) {
    for (const event of round.events) {
      const attackMatch = event.match(ATTACK_EVENT_PATTERN);
      if (attackMatch) {
        const [, attacker, target, rawDamage] = attackMatch;
        const damage = Number(rawDamage);
        const attackerTotals = totals.get(attacker);
        const targetTotals = totals.get(target);

        if (attackerTotals) {
          attackerTotals.shotsFired += 1;
          attackerTotals.damageDealt += damage;
        }

        if (targetTotals) {
          targetTotals.damageTaken += damage;
          targetTotals.hp -= damage;
        }

        continue;
      }

      const eliminationMatch = event.match(ELIMINATION_EVENT_PATTERN);
      if (eliminationMatch) {
        const [, target] = eliminationMatch;
        const targetTotals = totals.get(target);
        if (targetTotals) {
          targetTotals.eliminated = true;
          targetTotals.hp = 0;
        }
      }
    }
  }

  const snapshots = players.map((player, index) => {
    const normalizedStatus = normalizeStatus(player.status);
    const playerTotals = totals.get(player.name) ?? {
      hp: DISPLAY_MAX_HP,
      shotsFired: 0,
      damageDealt: 0,
      damageTaken: 0,
      eliminated: false,
    };
    const eliminated =
      playerTotals.eliminated ||
      normalizedStatus === "eliminated" ||
      normalizedStatus === "failed";
    const shotsFired = hasRoundLogs
      ? playerTotals.shotsFired
      : inferFallbackShotsFired(normalizedStatus, index, result.rounds, ammoCapacity);
    const hp = eliminated
      ? 0
      : clamp(
          hasRoundLogs
            ? Math.round(playerTotals.hp)
            : inferFallbackHp(normalizedStatus, index),
          0,
          DISPLAY_MAX_HP
        );
    const tone = determineTone(normalizedStatus, eliminated);
    const statusLabel = formatStatusLabel(normalizedStatus, player.status);

    return {
      name: player.name,
      score: player.score,
      status: player.status,
      statusLabel,
      rank: index + 1,
      hp,
      maxHp: DISPLAY_MAX_HP,
      ammo: clamp(ammoCapacity - shotsFired, 0, ammoCapacity),
      maxAmmo: ammoCapacity,
      shotsFired,
      damageDealt: playerTotals.damageDealt,
      damageTaken: playerTotals.damageTaken,
      eliminated,
      tone,
      insight: buildInsight(tone, statusLabel),
    } satisfies PlayerCombatSnapshot;
  });

  const winner =
    snapshots.find((player) => player.name === result.winner) ??
    snapshots[0] ??
    {
      name: result.winner,
      score: 0,
      status: "winner",
      statusLabel: "Winner",
      rank: 1,
      hp: DISPLAY_MAX_HP,
      maxHp: DISPLAY_MAX_HP,
      ammo: ammoCapacity,
      maxAmmo: ammoCapacity,
      shotsFired: 0,
      damageDealt: 0,
      damageTaken: 0,
      eliminated: false,
      tone: "winner",
      insight: "Closed the match on top of the leaderboard.",
    };

  const activePlayers = snapshots.filter((player) => !player.eliminated).length;
  const eliminatedPlayers = snapshots.length - activePlayers;
  const totalEvents = result.round_logs.reduce(
    (sum, round) => sum + round.events.length,
    0
  );
  const totalScore = snapshots.reduce((sum, player) => sum + player.score, 0);

  return {
    winner,
    players: snapshots,
    stats: {
      activePlayers,
      eliminatedPlayers,
      totalEvents,
      playerCount: snapshots.length,
      totalScore,
    },
  };
}

function normalizeStatus(status: string): NormalizedStatus {
  const value = status.trim().toLowerCase();

  if (value.includes("winner")) {
    return "winner";
  }
  if (value.includes("failed")) {
    return "failed";
  }
  if (
    value.includes("eliminated") ||
    value.includes("dead") ||
    value.includes("out")
  ) {
    return "eliminated";
  }
  if (
    value.includes("alive") ||
    value.includes("survived") ||
    value.includes("running") ||
    value.includes("ally")
  ) {
    return "active";
  }
  if (value.includes("finished")) {
    return "finished";
  }

  return "active";
}

function determineTone(
  status: NormalizedStatus,
  eliminated: boolean
): PlayerCardTone {
  if (status === "winner") {
    return "winner";
  }
  if (eliminated) {
    return "eliminated";
  }
  if (status === "finished" || status === "failed") {
    return "neutral";
  }
  return "active";
}

function formatStatusLabel(status: NormalizedStatus, rawStatus: string) {
  if (status === "winner") {
    return "Winner";
  }
  if (status === "active") {
    return rawStatus.toLowerCase() === "running" ? "Running" : "Operational";
  }
  if (status === "finished") {
    return "Finished";
  }
  if (status === "failed") {
    return "Failed";
  }
  return "Eliminated";
}

function inferFallbackHp(status: NormalizedStatus, index: number) {
  if (status === "winner") {
    return DISPLAY_MAX_HP - 1;
  }
  if (status === "eliminated" || status === "failed") {
    return 0;
  }
  if (status === "finished") {
    return Math.max(2, DISPLAY_MAX_HP - 3);
  }
  return Math.max(2, DISPLAY_MAX_HP - (index + 2));
}

function inferFallbackShotsFired(
  status: NormalizedStatus,
  index: number,
  rounds: number,
  ammoCapacity: number
) {
  const safeRounds = Math.max(rounds, 1);

  if (status === "winner") {
    return Math.min(ammoCapacity - 1, Math.max(2, safeRounds));
  }
  if (status === "eliminated") {
    return Math.min(ammoCapacity - 1, Math.max(1, Math.ceil(safeRounds / 2) + 1));
  }
  if (status === "finished") {
    return Math.min(ammoCapacity - 2, Math.max(1, Math.ceil(safeRounds / 2)));
  }
  return Math.min(ammoCapacity - 2, Math.max(1, safeRounds - index));
}

function buildInsight(tone: PlayerCardTone, statusLabel: string) {
  if (tone === "winner") {
    return "Closed the arena with the cleanest finish and the strongest final score.";
  }
  if (tone === "active") {
    return "Stayed combat-ready deep into the match and kept pressure on the board.";
  }
  if (tone === "eliminated") {
    return "Took decisive damage during the showdown and dropped out before the final horn.";
  }
  return `Ended the match with a ${statusLabel.toLowerCase()} result and a stable scoreboard contribution.`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
