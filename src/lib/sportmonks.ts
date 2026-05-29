'use server'

export interface SportMonksResponse<T> {
  data: T;
  pagination?: {
    count: number;
    per_page: number;
    current_page: number;
    next_page: string | null;
    has_more: boolean;
  };
  subscription?: any[];
  rate_limit?: {
    resets_in_seconds: number;
    remaining: number;
    requested_entity: string;
  };
  timezone?: string;
}

export interface SportMonksParticipant {
  id: number;
  sport_id: number;
  country_id: number;
  venue_id: number;
  gender: string;
  name: string;
  short_code: string;
  image_path: string;
  founded: number;
  type: string;
  placeholder: boolean;
  last_played_at: string;
  meta: {
    location: string;
    winner: boolean;
    position: number;
  };
}

export interface SportMonksScore {
  id: number;
  fixture_id: number;
  type_id: number;
  participant_id: number;
  score: {
    goals: number;
    participant: string;
  };
  description: string;
}

export interface SportMonksFixture {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  group_id: number | null;
  aggregate_id: number | null;
  round_id: number;
  state_id: number;
  venue_id: number;
  name: string;
  starting_at: string;
  result_info: string | null;
  leg: string;
  details: string | null;
  length: number;
  placeholder: boolean;
  has_odds: boolean;
  has_premium_odds: boolean;
  starting_at_timestamp: number;
  participants: SportMonksParticipant[];
  scores: SportMonksScore[];
  // Includes we asked for:
  periods?: any[];
  events?: any[];
  league?: {
    id: number;
    country: any;
  };
  round?: any;
}

const API_BASE = 'https://api.sportmonks.com/v3/football'

/**
 * Fetches in-play live scores matching the user's specific requested endpoint:
 * https://api.sportmonks.com/v3/football/livescores/inplay?include=participants;scores;periods;events;league.country;round
 */
export async function getLiveInPlayFixtures(): Promise<SportMonksFixture[]> {
  const token = process.env.NEXT_PUBLIC_SPORTMONKS_API_TOKEN
  if (!token) return []

  try {
    const res = await fetch(`${API_BASE}/livescores/inplay?include=participants;scores;periods;events;league.country;round&api_token=${token}`, {
      next: { revalidate: 30 }
    })
    if (!res.ok) return []
    const json = await res.json() as SportMonksResponse<SportMonksFixture[]>
    return json.data || []
  } catch (error) {
    return []
  }
}

/**
 * Fetches all fixtures for today. Used as a fallback if no matches are currently in play.
 */
export async function getTodaysFixtures(): Promise<SportMonksFixture[]> {
  const token = process.env.NEXT_PUBLIC_SPORTMONKS_API_TOKEN
  if (!token) return []

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  try {
    const res = await fetch(`${API_BASE}/fixtures/date/${today}?include=participants;scores;periods;events;league.country;round&api_token=${token}`, {
      next: { revalidate: 60 } // Cache for 60s
    })
    if (!res.ok) return []
    const json = await res.json() as SportMonksResponse<SportMonksFixture[]>
    return json.data || []
  } catch (error) {
    return []
  }
}
