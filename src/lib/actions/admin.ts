'use strict';
'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateMatchPoints, calculateGroupRankingPoints, calculateTopScorerBonus, calculateWinnerBonus } from '@/lib/scoring';
import { revalidatePath } from 'next/cache';

/**
 * Confirm match result and trigger scoring for all participants
 */
export async function confirmMatchResult(formData: FormData) {
    const supabase = await createClient();

    // Verify admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase.from('profiles').select('is_global_admin').eq('id', user.id).single();
    if (!profile?.is_global_admin) throw new Error('Unauthorized');

    const matchId = formData.get('matchId') as string;
    const homeScore = parseInt(formData.get('homeScore') as string);
    const awayScore = parseInt(formData.get('awayScore') as string);
    const winnerId = formData.get('winnerId') as string || null;

    // 1. Update match result
    const { error: matchError } = await supabase
        .from('matches')
        .update({
            home_score: homeScore,
            away_score: awayScore,
            winner_team_id: winnerId,
            result_confirmed: true
        })
        .eq('id', matchId);

    if (matchError) throw new Error(matchError.message);

    // 2. Fetch all predictions for this match
    const { data: predictions, error: predError } = await supabase
        .from('match_predictions')
        .select('*, matches(competition_stage)')
        .eq('match_id', matchId);

    if (predError) throw new Error(predError.message);

    // 3. Calculate points and update predictions
    for (const pred of predictions) {
        const points = calculateMatchPoints(
            pred.matches.competition_stage,
            { homeScore, awayScore, winnerId },
            { homeScore: pred.predicted_home_score, awayScore: pred.predicted_away_score, winnerId: pred.predicted_winner_id }
        );

        await supabase
            .from('match_predictions')
            .update({ points_awarded: points, locked: true })
            .eq('id', pred.id);

        // Trigger leaderboard update for this user
        // We'll call a DB function for efficiency or handle it here
        await updateLeaderboardForUser(pred.user_id);
    }

    revalidatePath('/', 'layout');
}

/**
 * Updates a user's cached total across all leagues they are in
 * Simplified: in a real app you'd probably filter by competition_id
 */
async function updateLeaderboardForUser(userId: string) {
    const supabase = await createClient();

    // Get all memberships
    const { data: memberships } = await supabase
        .from('competition_members')
        .select('competition_id')
        .eq('user_id', userId);

    if (!memberships) return;

    for (const membership of memberships) {
        // 1. Sum match points
        const { data: matchData } = await supabase
            .from('match_predictions')
            .select('points_awarded')
            .eq('user_id', userId)
            .eq('match_id', 'IN (SELECT id FROM matches WHERE result_confirmed = true)'); // This SQL syntax is pseudo, using raw filter is better

        // Better way: Sum via RPC or complex filter
        // For this prototype, I'll use separate sums

        const { data: matchSum } = await supabase.rpc('sum_user_match_points', {
            p_user_id: userId,
            p_competition_id: membership.competition_id
        });

        const { data: groupSum } = await supabase.rpc('sum_user_group_points', {
            p_user_id: userId,
            p_competition_id: membership.competition_id
        });

        const { data: tournamentData } = await supabase
            .from('tournament_predictions')
            .select('top_scorer_points, wc_winner_points')
            .eq('user_id', userId)
            .eq('competition_id', membership.competition_id)
            .single();

        // Call the postgres helper function I defined in schema
        await supabase.rpc('upsert_leaderboard', {
            p_competition_id: membership.competition_id,
            p_user_id: userId,
            p_match_points: matchSum || 0,
            p_group_ranking_points: groupSum || 0,
            p_top_scorer_bonus: tournamentData?.top_scorer_points || 0,
            p_winner_bonus: tournamentData?.wc_winner_points || 0
        });
    }
}
