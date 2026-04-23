export type PlayerResult = {
  name: string;
  score: number;
  status: string;
};

export type RoundLog = {
  round: number;
  events: string[];
  remaining_players: string[];
};

export type MatchResult = {
  match_id: string;
  game: string;
  rounds: number;
  winner: string;
  players: PlayerResult[];
  summary: string;
  source: string;
  status: string;
  round_logs: RoundLog[];
};

export type MatchCreateResponse = {
  id: string;
  game: string;
  rounds: number;
  player_count: number;
  status: string;
  message: string;
  source: string;
  result?: MatchResult | null;
};
