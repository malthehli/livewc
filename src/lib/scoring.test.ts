import { describe, it, expect } from 'vitest';
import {
    calculateMatchPoints,
    calculateGroupRankingPoints,
    calculateTopScorerBonus,
    calculateWinnerBonus,
    calculateTotalScore
} from './scoring';

describe('Scoring Logic', () => {

    describe('calculateMatchPoints', () => {
        it('calculates group stage correct outcome + exact score', () => {
            const points = calculateMatchPoints(
                'group',
                { homeScore: 2, awayScore: 1, winnerId: null }, // actual
                { homeScore: 2, awayScore: 1, winnerId: null }  // prediction
            );
            expect(points).toBe(5); // outcome: 2, exact: 3
        });

        it('calculates group stage correct outcome only', () => {
            const points = calculateMatchPoints(
                'group',
                { homeScore: 2, awayScore: 1, winnerId: null }, // actual
                { homeScore: 3, awayScore: 0, winnerId: null }  // prediction
            );
            expect(points).toBe(2); // outcome: 2, exact: 0
        });

        it('calculates group stage incorrect outcome', () => {
            const points = calculateMatchPoints(
                'group',
                { homeScore: 2, awayScore: 1, winnerId: null }, // actual (home win)
                { homeScore: 1, awayScore: 2, winnerId: null }  // prediction (away win)
            );
            expect(points).toBe(0);
        });

        it('calculates group stage draw outcome', () => {
            const points = calculateMatchPoints(
                'group',
                { homeScore: 1, awayScore: 1, winnerId: null },
                { homeScore: 0, awayScore: 0, winnerId: null }
            );
            expect(points).toBe(2); // correct outcome (draw), not exact score
        });

        it('calculates R32 knockout stage points (winner correct + exact score)', () => {
            const points = calculateMatchPoints(
                'r32',
                { homeScore: 2, awayScore: 1, winnerId: 'team1' },
                { homeScore: 2, awayScore: 1, winnerId: 'team1' }
            );
            expect(points).toBe(7); // outcome: 3, exact: 4
        });

        it('calculates knockout stage (winner correct but score different, e.g. penalties)', () => {
            const points = calculateMatchPoints(
                'sf',
                { homeScore: 1, awayScore: 1, winnerId: 'team2' }, // actual draw, team2 wins pens
                { homeScore: 0, awayScore: 1, winnerId: 'team2' }  // predicted team2 wins in 90m
            );
            // Outcome correct (winnerId matches), but score not exact
            expect(points).toBe(6); // sf outcome: 6
        });
        
        it('calculates zero points if outcome is incorrect even if score is somehow magically matched (should not happen usually, but checks logic)', () => {
             const points = calculateMatchPoints(
                'r16',
                { homeScore: 1, awayScore: 1, winnerId: 'teamA' }, // actual teamA wins pens
                { homeScore: 1, awayScore: 1, winnerId: 'teamB' }  // predicted teamB wins pens
            );
            expect(points).toBe(0); // outcome wrong -> 0
        });
    });

    describe('calculateGroupRankingPoints', () => {
        it('gives 5 points for perfect ranking', () => {
            const pts = calculateGroupRankingPoints(
                ['t1', 't2', 't3', 't4'], // actual
                ['t1', 't2', 't3', 't4']  // predicted
            );
            expect(pts).toBe(5);
        });

        it('gives 1 point per correct position', () => {
            const pts = calculateGroupRankingPoints(
                ['t1', 't2', 't3', 't4'],
                ['t1', 't3', 't2', 't4']
            );
            expect(pts).toBe(2); // t1 and t4 correct
        });
    });

    describe('calculateTopScorerBonus', () => {
        it('gives 15 points for correct top scorer, case insensitive', () => {
            expect(calculateTopScorerBonus('Mbappe', 'mbappe ')).toBe(15);
            expect(calculateTopScorerBonus('Messi', ' Ronaldo ')).toBe(0);
        });
    });

    describe('calculateWinnerBonus', () => {
        it('gives 15 points for correct winner', () => {
            expect(calculateWinnerBonus('arg_id', 'arg_id')).toBe(15);
            expect(calculateWinnerBonus('fra_id', 'arg_id')).toBe(0);
        });
    });

    describe('calculateTotalScore', () => {
        it('sums all components', () => {
            const total = calculateTotalScore({
                matchPoints: 25,
                groupRankingPoints: 10,
                topScorerBonus: 15,
                winnerBonus: 0
            });
            expect(total).toBe(50);
        });
    });
});
