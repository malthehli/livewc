/**
 * World Cup Prediction Game Scoring Engine
 */

export type MatchStage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final';

export interface MatchResult {
    homeScore: number;
    awayScore: number;
    winnerId: string | null; // ID of the team that advances/wins (can be null for draws in group stage)
}

export interface MatchPrediction {
    homeScore: number;
    awayScore: number;
    winnerId: string | null; // ID of the team the user thinks will advance/win
}

/**
 * 1. Match prediction points
 * Rules:
 * - Outcome points awarded for correct winner/draw.
 * - Exact score bonus only if outcome is correct.
 */
export function calculateMatchPoints(
    stage: MatchStage,
    actual: MatchResult,
    predicted: MatchPrediction
): number {
    let points = 0;

    // Define scoring rules per stage
    const rules = {
        group: { outcome: 2, exact: 3 },
        r32: { outcome: 3, exact: 4 },
        r16: { outcome: 4, exact: 5 },
        qf: { outcome: 5, exact: 6 },
        sf: { outcome: 6, exact: 7 },
        final: { outcome: 7, exact: 6 },
    };

    const currentRules = rules[stage];

    // Determine actual outcome
    const actualOutcome = actual.homeScore > actual.awayScore
        ? 'home'
        : actual.homeScore < actual.awayScore
            ? 'away'
            : 'draw';

    // Determine predicted outcome
    const predictedOutcome = predicted.homeScore > predicted.awayScore
        ? 'home'
        : predicted.homeScore < predicted.awayScore
            ? 'away'
            : 'draw';

    // Check outcome correctness
    let outcomeCorrect = false;

    if (stage === 'group') {
        // In group stage, just check the 1X2 result
        outcomeCorrect = actualOutcome === predictedOutcome;
    } else {
        // In knockout stages, winnerId must match
        // Usually winnerId is the team that advances (penalties included)
        outcomeCorrect = actual.winnerId === predicted.winnerId && actual.winnerId !== null;
    }

    if (outcomeCorrect) {
        points += currentRules.outcome;

        // Check exact scoreline
        if (
            actual.homeScore === predicted.homeScore &&
            actual.awayScore === predicted.awayScore
        ) {
            points += currentRules.exact;
        }
    }

    return points;
}

/**
 * 2. Group ranking points
 * Rules:
 * - Correct position = 1 point each.
 * - All positions correct = +1 bonus point.
 * - Max per group = 4 + 1 = 5 (assuming 4 teams per group as per prompt)
 * For 2026 (groups of 3), max would be 3 + 1 = 4.
 * The prompt specified "Each correct team position gives the player 1 point... bonus point for perfect group ranking (4 teams)."
 */
export function calculateGroupRankingPoints(
    actualRanking: string[], // Array of team IDs in finish order
    predictedRanking: string[]
): number {
    let points = 0;
    let allCorrect = true;

    const length = Math.min(actualRanking.length, predictedRanking.length);

    for (let i = 0; i < length; i++) {
        if (actualRanking[i] === predictedRanking[i]) {
            points += 1;
        } else {
            allCorrect = false;
        }
    }

    if (allCorrect && length > 0) {
        points += 1;
    }

    return points;
}

/**
 * 3. Top scorer bonus
 * Rule: 15 points if correct.
 */
export function calculateTopScorerBonus(
    actualName: string,
    predictedName: string
): number {
    if (!actualName || !predictedName) return 0;
    // Case-insensitive comparison and trim
    return actualName.trim().toLowerCase() === predictedName.trim().toLowerCase() ? 15 : 0;
}

/**
 * 4. World Cup winner bonus
 * Rule: 15 points if correct.
 */
export function calculateWinnerBonus(
    actualTeamId: string,
    predictedTeamId: string
): number {
    if (!actualTeamId || !predictedTeamId) return 0;
    return actualTeamId === predictedTeamId ? 15 : 0;
}

/**
 * 5. Total leaderboard score
 */
export interface ScoreBreakdown {
    matchPoints: number;
    groupRankingPoints: number;
    topScorerBonus: number;
    winnerBonus: number;
}

export function calculateTotalScore(breakdown: ScoreBreakdown): number {
    return (
        breakdown.matchPoints +
        breakdown.groupRankingPoints +
        breakdown.topScorerBonus +
        breakdown.winnerBonus
    );
}
