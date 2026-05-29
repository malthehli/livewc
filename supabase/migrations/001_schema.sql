-- ============================================================
-- World Cup 2026 Prediction Game — Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  is_global_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,  -- e.g. 'BRA', 'FRA'
  flag_emoji TEXT,
  group_code TEXT,            -- 'A'–'L' for 2026 (16 groups)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams viewable by all" ON public.teams FOR SELECT USING (TRUE);
CREATE POLICY "Teams editable by global admins" ON public.teams FOR ALL TO authenticated
  USING ((SELECT is_global_admin FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- COMPETITIONS (private leagues)
-- ============================================================
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  wc_year INT DEFAULT 2026,
  status TEXT NOT NULL DEFAULT 'setup'  -- 'setup' | 'active' | 'finished'
    CHECK (status IN ('setup', 'active', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Competitions viewable by members"
  ON public.competitions FOR SELECT TO authenticated
  USING (
    id IN (SELECT competition_id FROM public.competition_members WHERE user_id = auth.uid())
    OR created_by = auth.uid()
  );

CREATE POLICY "Competitions creatable by authenticated users"
  ON public.competitions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Competitions updatable by creator"
  ON public.competitions FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================
-- COMPETITION MEMBERS
-- ============================================================
CREATE TABLE public.competition_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (competition_id, user_id)
);

ALTER TABLE public.competition_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members viewable by competition members"
  ON public.competition_members FOR SELECT TO authenticated
  USING (
    competition_id IN (SELECT competition_id FROM public.competition_members WHERE user_id = auth.uid())
    OR competition_id IN (SELECT id FROM public.competitions WHERE created_by = auth.uid())
  );

CREATE POLICY "Members can join competitions"
  ON public.competition_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave competitions"
  ON public.competition_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_number INT,
  competition_stage TEXT NOT NULL CHECK (
    competition_stage IN ('group', 'r32', 'r16', 'qf', 'sf', 'final')
  ),
  group_code TEXT,              -- Only for group stage matches
  home_team_id UUID REFERENCES public.teams(id),
  away_team_id UUID REFERENCES public.teams(id),
  kickoff_at TIMESTAMPTZ,
  venue TEXT,
  home_score INT,               -- NULL until result confirmed
  away_score INT,               -- NULL until result confirmed
  winner_team_id UUID REFERENCES public.teams(id), -- NULL for draws, or team that advances
  result_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches viewable by all" ON public.matches FOR SELECT USING (TRUE);
CREATE POLICY "Matches editable by global admins" ON public.matches FOR ALL TO authenticated
  USING ((SELECT is_global_admin FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- MATCH PREDICTIONS
-- ============================================================
CREATE TABLE public.match_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_home_score INT NOT NULL,
  predicted_away_score INT NOT NULL,
  -- For knockout matches: the team they think will advance
  predicted_winner_id UUID REFERENCES public.teams(id),
  points_awarded INT DEFAULT 0,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, match_id)
);

ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view predictions in their competitions"
  ON public.match_predictions FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR match_id IN (SELECT id FROM public.matches)  -- All predictions visible for leaderboard
  );

CREATE POLICY "Users can insert own predictions"
  ON public.match_predictions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND locked = FALSE);

CREATE POLICY "Users can update own unlocked predictions"
  ON public.match_predictions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND locked = FALSE);

CREATE POLICY "Admins can update predictions (for scoring)"
  ON public.match_predictions FOR UPDATE TO authenticated
  USING ((SELECT is_global_admin FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- GROUP RANKING PREDICTIONS
-- (2026 WC: 16 groups of 3 teams each)
-- ============================================================
CREATE TABLE public.group_ranking_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  group_code TEXT NOT NULL,
  rank_1_team_id UUID NOT NULL REFERENCES public.teams(id),
  rank_2_team_id UUID NOT NULL REFERENCES public.teams(id),
  rank_3_team_id UUID NOT NULL REFERENCES public.teams(id),
  points_awarded INT DEFAULT 0,
  scored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, competition_id, group_code)
);

ALTER TABLE public.group_ranking_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group ranking predictions viewable by competition members"
  ON public.group_ranking_predictions FOR SELECT TO authenticated
  USING (
    competition_id IN (SELECT competition_id FROM public.competition_members WHERE user_id = auth.uid())
    OR competition_id IN (SELECT id FROM public.competitions WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage own group ranking predictions"
  ON public.group_ranking_predictions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- GROUP FINAL RANKINGS (set by admin)
-- ============================================================
CREATE TABLE public.group_final_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_code TEXT NOT NULL UNIQUE,
  rank_1_team_id UUID NOT NULL REFERENCES public.teams(id),
  rank_2_team_id UUID NOT NULL REFERENCES public.teams(id),
  rank_3_team_id UUID NOT NULL REFERENCES public.teams(id),
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.group_final_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group final rankings viewable by all" ON public.group_final_rankings FOR SELECT USING (TRUE);
CREATE POLICY "Group final rankings editable by global admins" ON public.group_final_rankings FOR ALL TO authenticated
  USING ((SELECT is_global_admin FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- TOURNAMENT PREDICTIONS (top scorer + winner)
-- ============================================================
CREATE TABLE public.tournament_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  top_scorer_name TEXT,         -- Free text player name
  wc_winner_team_id UUID REFERENCES public.teams(id),
  top_scorer_points INT DEFAULT 0,
  wc_winner_points INT DEFAULT 0,
  scored BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, competition_id)
);

ALTER TABLE public.tournament_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournament predictions viewable by competition members"
  ON public.tournament_predictions FOR SELECT TO authenticated
  USING (
    competition_id IN (SELECT competition_id FROM public.competition_members WHERE user_id = auth.uid())
    OR competition_id IN (SELECT id FROM public.competitions WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage own tournament predictions"
  ON public.tournament_predictions FOR ALL TO authenticated
  USING (auth.uid() = user_id AND locked = FALSE)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update tournament predictions"
  ON public.tournament_predictions FOR UPDATE TO authenticated
  USING ((SELECT is_global_admin FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- TOURNAMENT RESULTS (set by admin — singleton per WC)
-- ============================================================
CREATE TABLE public.tournament_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wc_year INT NOT NULL UNIQUE DEFAULT 2026,
  top_scorer_name TEXT,
  wc_winner_team_id UUID REFERENCES public.teams(id),
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ
);

ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournament results viewable by all" ON public.tournament_results FOR SELECT USING (TRUE);
CREATE POLICY "Tournament results editable by global admins" ON public.tournament_results FOR ALL TO authenticated
  USING ((SELECT is_global_admin FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- LEADERBOARD CACHE
-- ============================================================
CREATE TABLE public.leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_points INT DEFAULT 0,
  group_ranking_points INT DEFAULT 0,
  top_scorer_bonus INT DEFAULT 0,
  winner_bonus INT DEFAULT 0,
  total_points INT DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (competition_id, user_id)
);

ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard viewable by competition members"
  ON public.leaderboard_cache FOR SELECT TO authenticated
  USING (
    competition_id IN (SELECT competition_id FROM public.competition_members WHERE user_id = auth.uid())
    OR competition_id IN (SELECT id FROM public.competitions WHERE created_by = auth.uid())
  );

CREATE POLICY "Leaderboard editable by global admins"
  ON public.leaderboard_cache FOR ALL TO authenticated
  USING ((SELECT is_global_admin FROM public.profiles WHERE id = auth.uid()));

-- Allow service role to update leaderboard
CREATE POLICY "Service role can manage leaderboard"
  ON public.leaderboard_cache FOR ALL
  TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Same for predictions
CREATE POLICY "Service role can manage match predictions"
  ON public.match_predictions FOR ALL
  TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role can manage group ranking predictions"
  ON public.group_ranking_predictions FOR ALL
  TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role can manage tournament predictions"
  ON public.tournament_predictions FOR ALL
  TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function: upsert leaderboard entry
CREATE OR REPLACE FUNCTION public.upsert_leaderboard(
  p_competition_id UUID,
  p_user_id UUID,
  p_match_points INT DEFAULT 0,
  p_group_ranking_points INT DEFAULT 0,
  p_top_scorer_bonus INT DEFAULT 0,
  p_winner_bonus INT DEFAULT 0
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.leaderboard_cache (
    competition_id, user_id, match_points, group_ranking_points,
    top_scorer_bonus, winner_bonus, total_points, last_updated_at
  ) VALUES (
    p_competition_id, p_user_id,
    p_match_points, p_group_ranking_points, p_top_scorer_bonus, p_winner_bonus,
    p_match_points + p_group_ranking_points + p_top_scorer_bonus + p_winner_bonus,
    NOW()
  )
  ON CONFLICT (competition_id, user_id) DO UPDATE SET
    match_points = EXCLUDED.match_points,
    group_ranking_points = EXCLUDED.group_ranking_points,
    top_scorer_bonus = EXCLUDED.top_scorer_bonus,
    winner_bonus = EXCLUDED.winner_bonus,
    total_points = EXCLUDED.total_points,
    last_updated_at = NOW();
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_leaderboard TO service_role;
