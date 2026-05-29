export interface Team {
    id: string;
    name: string;
    code: string;
    iso2: string; // Added for flags
    group: string;
}

export interface Fixture {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    date: string;
    stage: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL';
    homeScore: number | null;
    awayScore: number | null;
    status: 'SCHEDULED' | 'IN_PLAY' | 'FINISHED';
}

export const TEAMS: Team[] = [
    // Group A
    { id: 't-mex', name: 'Mexico', code: 'MEX', iso2: 'mx', group: 'A' },
    { id: 't-rsa', name: 'South Africa', code: 'RSA', iso2: 'za', group: 'A' },
    { id: 't-kor', name: 'Korea Republic', code: 'KOR', iso2: 'kr', group: 'A' },
    { id: 't-cze', name: 'Czechia', code: 'CZE', iso2: 'cz', group: 'A' },
    // Group B
    { id: 't-can', name: 'Canada', code: 'CAN', iso2: 'ca', group: 'B' },
    { id: 't-qat', name: 'Qatar', code: 'QAT', iso2: 'qa', group: 'B' },
    { id: 't-sui', name: 'Switzerland', code: 'SUI', iso2: 'ch', group: 'B' },
    { id: 't-ita', name: 'Italy', code: 'ITA', iso2: 'it', group: 'B' },
    // Group C
    { id: 't-bra', name: 'Brazil', code: 'BRA', iso2: 'br', group: 'C' },
    { id: 't-mar', name: 'Morocco', code: 'MAR', iso2: 'ma', group: 'C' },
    { id: 't-hai', name: 'Haiti', code: 'HAI', iso2: 'ht', group: 'C' },
    { id: 't-sco', name: 'Scotland', code: 'SCO', iso2: 'gb-sct', group: 'C' },
    // Group D
    { id: 't-usa', name: 'USA', code: 'USA', iso2: 'us', group: 'D' },
    { id: 't-par', name: 'Paraguay', code: 'PAR', iso2: 'py', group: 'D' },
    { id: 't-aus', name: 'Australia', code: 'AUS', iso2: 'au', group: 'D' },
    { id: 't-rou', name: 'Romania', code: 'ROU', iso2: 'ro', group: 'D' },
    // Group E
    { id: 't-ger', name: 'Germany', code: 'GER', iso2: 'de', group: 'E' },
    { id: 't-cuw', name: 'Curaçao', code: 'CUW', iso2: 'cw', group: 'E' },
    { id: 't-civ', name: 'Côte d’Ivoire', code: 'CIV', iso2: 'ci', group: 'E' },
    { id: 't-ecu', name: 'Ecuador', code: 'ECU', iso2: 'ec', group: 'E' },
    // Group F
    { id: 't-ned', name: 'Netherlands', code: 'NED', iso2: 'nl', group: 'F' },
    { id: 't-jpn', name: 'Japan', code: 'JPN', iso2: 'jp', group: 'F' },
    { id: 't-tun', name: 'Tunisia', code: 'TUN', iso2: 'tn', group: 'F' },
    { id: 't-pol', name: 'Poland', code: 'POL', iso2: 'pl', group: 'F' },
    // Group G
    { id: 't-bel', name: 'Belgium', code: 'BEL', iso2: 'be', group: 'G' },
    { id: 't-egy', name: 'Egypt', code: 'EGY', iso2: 'eg', group: 'G' },
    { id: 't-irn', name: 'IR Iran', code: 'IRN', iso2: 'ir', group: 'G' },
    { id: 't-nzl', name: 'New Zealand', code: 'NZL', iso2: 'nz', group: 'G' },
    // Group H
    { id: 't-esp', name: 'Spain', code: 'ESP', iso2: 'es', group: 'H' },
    { id: 't-cpv', name: 'Cabo Verde', code: 'CPV', iso2: 'cv', group: 'H' },
    { id: 't-ksa', name: 'Saudi Arabia', code: 'KSA', iso2: 'sa', group: 'H' },
    { id: 't-uru', name: 'Uruguay', code: 'URU', iso2: 'uy', group: 'H' },
    // Group I
    { id: 't-arg', name: 'Argentina', code: 'ARG', iso2: 'ar', group: 'I' },
    { id: 't-mli', name: 'Mali', code: 'MLI', iso2: 'ml', group: 'I' },
    { id: 't-crc', name: 'Costa Rica', code: 'CRC', iso2: 'cr', group: 'I' },
    { id: 't-srb', name: 'Serbia', code: 'SRB', iso2: 'rs', group: 'I' },
    // Group J
    { id: 't-fra', name: 'France', code: 'FRA', iso2: 'fr', group: 'J' },
    { id: 't-sen', name: 'Senegal', code: 'SEN', iso2: 'sn', group: 'J' },
    { id: 't-per', name: 'Peru', code: 'PER', iso2: 'pe', group: 'J' },
    { id: 't-wal', name: 'Wales', code: 'WAL', iso2: 'gb-wls', group: 'J' },
    // Group K
    { id: 't-por', name: 'Portugal', code: 'POR', iso2: 'pt', group: 'K' },
    { id: 't-cod', name: 'DR Congo', code: 'COD', iso2: 'cd', group: 'K' },
    { id: 't-uzb', name: 'Uzbekistan', code: 'UZB', iso2: 'uz', group: 'K' },
    { id: 't-col', name: 'Colombia', code: 'COL', iso2: 'co', group: 'K' },
    // Group L
    { id: 't-eng', name: 'England', code: 'ENG', iso2: 'gb-eng', group: 'L' },
    { id: 't-cro', name: 'Croatia', code: 'CRO', iso2: 'hr', group: 'L' },
    { id: 't-gha', name: 'Ghana', code: 'GHA', iso2: 'gh', group: 'L' },
    { id: 't-pan', name: 'Panama', code: 'PAN', iso2: 'pa', group: 'L' },
];

// Mock first round of matches
export const FIXTURES: Fixture[] = [
    { id: 'm-1', homeTeamId: 't-mex', awayTeamId: 't-rsa', date: '2026-06-11T19:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { id: 'm-2', homeTeamId: 't-kor', awayTeamId: 't-cze', date: '2026-06-11T22:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { id: 'm-3', homeTeamId: 't-can', awayTeamId: 't-qat', date: '2026-06-12T19:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { id: 'm-4', homeTeamId: 't-sui', awayTeamId: 't-ita', date: '2026-06-12T22:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { id: 'm-5', homeTeamId: 't-bra', awayTeamId: 't-mar', date: '2026-06-13T16:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { id: 'm-6', homeTeamId: 't-usa', awayTeamId: 't-par', date: '2026-06-13T19:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { id: 'm-7', homeTeamId: 't-ger', awayTeamId: 't-cuw', date: '2026-06-14T16:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { id: 'm-8', homeTeamId: 't-ned', awayTeamId: 't-jpn', date: '2026-06-14T19:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { id: 'm-9', homeTeamId: 't-esp', awayTeamId: 't-cpv', date: '2026-06-15T19:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
    { id: 'm-10', homeTeamId: 't-eng', awayTeamId: 't-cro', date: '2026-06-16T19:00:00Z', stage: 'GROUP', homeScore: null, awayScore: null, status: 'SCHEDULED' },
];

// Helper to get team by ID
export const getTeam = (id: string) => TEAMS.find(t => t.id === id);
