// Mock data for development — replace with real Supabase data later

export const MOCK_TEAMS = [
    { id: 't-bra', name: 'Brazil', code: 'BRA', flag_emoji: '🇧🇷', group_code: 'A' },
    { id: 't-fra', name: 'France', code: 'FRA', flag_emoji: '🇫🇷', group_code: 'A' },
    { id: 't-ger', name: 'Germany', code: 'GER', flag_emoji: '🇩🇪', group_code: 'A' },
    { id: 't-arg', name: 'Argentina', code: 'ARG', flag_emoji: '🇦🇷', group_code: 'B' },
    { id: 't-eng', name: 'England', code: 'ENG', flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group_code: 'B' },
    { id: 't-esp', name: 'Spain', code: 'ESP', flag_emoji: '🇪🇸', group_code: 'B' },
    { id: 't-usa', name: 'USA', code: 'USA', flag_emoji: '🇺🇸', group_code: 'C' },
    { id: 't-mex', name: 'Mexico', code: 'MEX', flag_emoji: '🇲🇽', group_code: 'C' },
    { id: 't-can', name: 'Canada', code: 'CAN', flag_emoji: '🇨🇦', group_code: 'C' },
    { id: 't-por', name: 'Portugal', code: 'POR', flag_emoji: '🇵🇹', group_code: 'D' },
    { id: 't-mar', name: 'Morocco', code: 'MAR', flag_emoji: '🇲🇦', group_code: 'D' },
    { id: 't-jpn', name: 'Japan', code: 'JPN', flag_emoji: '🇯🇵', group_code: 'D' },
]

export const MOCK_MATCHES = [
    {
        id: 'm-1',
        match_number: 1,
        competition_stage: 'group',
        group_code: 'A',
        home_team: MOCK_TEAMS[0], // Brazil
        away_team: MOCK_TEAMS[1], // France
        home_team_id: 't-bra',
        away_team_id: 't-fra',
        kickoff_at: '2026-06-11T18:00:00Z',
        venue: 'MetLife Stadium, New Jersey',
        home_score: null,
        away_score: null,
        winner_team_id: null,
        result_confirmed: false,
    },
    {
        id: 'm-2',
        match_number: 2,
        competition_stage: 'group',
        group_code: 'A',
        home_team: MOCK_TEAMS[1], // France
        away_team: MOCK_TEAMS[2], // Germany
        home_team_id: 't-fra',
        away_team_id: 't-ger',
        kickoff_at: '2026-06-12T15:00:00Z',
        venue: 'AT&T Stadium, Dallas',
        home_score: null,
        away_score: null,
        winner_team_id: null,
        result_confirmed: false,
    },
    {
        id: 'm-3',
        match_number: 3,
        competition_stage: 'group',
        group_code: 'A',
        home_team: MOCK_TEAMS[2], // Germany
        away_team: MOCK_TEAMS[0], // Brazil
        home_team_id: 't-ger',
        away_team_id: 't-bra',
        kickoff_at: '2026-06-15T21:00:00Z',
        venue: 'SoFi Stadium, Los Angeles',
        home_score: null,
        away_score: null,
        winner_team_id: null,
        result_confirmed: false,
    },
    {
        id: 'm-4',
        match_number: 4,
        competition_stage: 'group',
        group_code: 'B',
        home_team: MOCK_TEAMS[3], // Argentina
        away_team: MOCK_TEAMS[4], // England
        home_team_id: 't-arg',
        away_team_id: 't-eng',
        kickoff_at: '2026-06-13T18:00:00Z',
        venue: 'Estadio Azteca, Mexico City',
        home_score: null,
        away_score: null,
        winner_team_id: null,
        result_confirmed: false,
    },
    {
        id: 'm-5',
        match_number: 5,
        competition_stage: 'group',
        group_code: 'B',
        home_team: MOCK_TEAMS[4], // England
        away_team: MOCK_TEAMS[5], // Spain
        home_team_id: 't-eng',
        away_team_id: 't-esp',
        kickoff_at: '2026-06-14T21:00:00Z',
        venue: 'Hard Rock Stadium, Miami',
        home_score: null,
        away_score: null,
        winner_team_id: null,
        result_confirmed: false,
    },
    {
        id: 'm-6',
        match_number: 6,
        competition_stage: 'group',
        group_code: 'C',
        home_team: MOCK_TEAMS[6], // USA
        away_team: MOCK_TEAMS[7], // Mexico
        home_team_id: 't-usa',
        away_team_id: 't-mex',
        kickoff_at: '2026-06-16T00:00:00Z',
        venue: 'Rose Bowl, Los Angeles',
        home_score: null,
        away_score: null,
        winner_team_id: null,
        result_confirmed: false,
    },
]

export const MOCK_GROUPS: Record<string, typeof MOCK_TEAMS> = {
    A: MOCK_TEAMS.filter(t => t.group_code === 'A'),
    B: MOCK_TEAMS.filter(t => t.group_code === 'B'),
    C: MOCK_TEAMS.filter(t => t.group_code === 'C'),
    D: MOCK_TEAMS.filter(t => t.group_code === 'D'),
}

export const MOCK_LEAGUE = {
    id: 'demo',
    name: 'Demo League 🏆',
    invite_code: 'DEMO2026',
    status: 'active',
}

export const MOCK_LEADERBOARD = [
    { user_id: 'u1', display_name: 'Alex M.', match_points: 24, group_ranking_points: 8, top_scorer_bonus: 15, winner_bonus: 0, total_points: 47 },
    { user_id: 'u2', display_name: 'Jamie K.', match_points: 20, group_ranking_points: 6, top_scorer_bonus: 0, winner_bonus: 15, total_points: 41 },
    { user_id: 'u3', display_name: 'Sam R.', match_points: 18, group_ranking_points: 10, top_scorer_bonus: 0, winner_bonus: 0, total_points: 28 },
    { user_id: 'u4', display_name: 'Jordan T.', match_points: 10, group_ranking_points: 4, top_scorer_bonus: 0, winner_bonus: 0, total_points: 14 },
]
