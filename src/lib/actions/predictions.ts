'use strict';
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Submit or update a match prediction
 */
export async function submitMatchPrediction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const matchId = formData.get('matchId') as string;
    const homeScore = parseInt(formData.get('homeScore') as string);
    const awayScore = parseInt(formData.get('awayScore') as string);
    const winnerId = formData.get('winnerId') as string || null;

    // Check if match has already started
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('kickoff_at, result_confirmed')
        .eq('id', matchId)
        .single();

    if (matchError || !match) throw new Error('Match not found');

    const kickoffAt = new Date(match.kickoff_at);
    if (kickoffAt < new Date()) {
        throw new Error('Prediction period has ended for this match.');
    }

    const { error } = await supabase
        .from('match_predictions')
        .upsert({
            user_id: user.id,
            match_id: matchId,
            predicted_home_score: homeScore,
            predicted_away_score: awayScore,
            predicted_winner_id: winnerId,
            locked: false
        });

    if (error) throw new Error(error.message);

    revalidatePath('/leagues/[id]/predictions', 'page');
    revalidatePath('/leagues/[id]/fixtures', 'page');
}

/**
 * Submit group ranking prediction
 */
export async function submitGroupRanking(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const competitionId = formData.get('competitionId') as string;
    const groupCode = formData.get('groupCode') as string;
    const rank1Id = formData.get('rank1Id') as string;
    const rank2Id = formData.get('rank2Id') as string;
    const rank3Id = formData.get('rank3Id') as string;

    // Note: 2026 format is 3 teams per group
    const { error } = await supabase
        .from('group_ranking_predictions')
        .upsert({
            user_id: user.id,
            competition_id: competitionId,
            group_code: groupCode,
            rank_1_team_id: rank1Id,
            rank_2_team_id: rank2Id,
            rank_3_team_id: rank3Id
        });

    if (error) throw new Error(error.message);

    revalidatePath('/leagues/[id]/group-rankings', 'page');
}

/**
 * Submit tournament predictions (top scorer + winner)
 */
export async function submitTournamentPrediction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const competitionId = formData.get('competitionId') as string;
    const topScorerName = formData.get('topScorerName') as string;
    const wcWinnerTeamId = formData.get('wcWinnerTeamId') as string;

    const { error } = await supabase
        .from('tournament_predictions')
        .upsert({
            user_id: user.id,
            competition_id: competitionId,
            top_scorer_name: topScorerName,
            wc_winner_team_id: wcWinnerTeamId,
            locked: false
        });

    if (error) throw new Error(error.message);

    revalidatePath('/leagues/[id]/tournament', 'page');
}
