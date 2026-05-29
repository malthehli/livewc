-- Users (Supabase Auth built-in, but we extend in public.profiles)
create table public.profiles (
  id uuid references auth.users on delete cascade,
  username text unique,
  avatar_url text,
  primary key (id)
);

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null, -- e.g., ARG, FRA
  group_name text -- e.g., 'A', 'B'
);

-- Leagues
create table public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  owner_id uuid references public.profiles(id)
);

-- League Members
create table public.league_members (
  league_id uuid references public.leagues(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (league_id, user_id)
);

-- Matches
create type match_stage as enum ('GROUP', 'R32', 'R16', 'QF', 'SF', 'FINAL');
create type match_status as enum ('SCHEDULED', 'IN_PLAY', 'FINISHED');

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  kickoff_time timestamptz not null,
  stage match_stage not null,
  status match_status default 'SCHEDULED',
  home_score integer,
  away_score integer,
  home_penalties integer,
  away_penalties integer,
  winning_team_id uuid references public.teams(id) -- Null if draw (only in group stage)
);

-- Match Predictions
create table public.match_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  home_score integer not null,
  away_score integer not null,
  predicted_winning_team_id uuid references public.teams(id),
  points_awarded integer default 0,
  unique(user_id, match_id)
);

-- Group Rankings (Actual)
create table public.group_rankings (
  group_name text,
  position integer, -- 1 to 4
  team_id uuid references public.teams(id),
  primary key (group_name, position)
);

-- Group Ranking Predictions
create table public.group_ranking_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  group_name text not null,
  team_id uuid references public.teams(id),
  predicted_position integer not null,
  points_awarded integer default 0,
  unique(user_id, group_name, predicted_position),
  unique(user_id, group_name, team_id)
);

-- Tournament Outcome Actual
create table public.tournament_results (
  id integer primary key default 1,
  winner_team_id uuid references public.teams(id),
  top_scorer_name text
);

-- Tournament Predictions
create table public.tournament_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  predicted_winner_team_id uuid references public.teams(id),
  predicted_top_scorer_name text,
  winner_points_awarded integer default 0,
  top_scorer_points_awarded integer default 0,
  unique(user_id)
);

-- User Scores (Materialized View or trigger updated table, here we use a table for simplicity that can be updated via RPC/triggers)
create table public.user_scores (
  user_id uuid references public.profiles(id) on delete cascade,
  total_points integer default 0,
  match_points integer default 0,
  group_ranking_points integer default 0,
  tournament_points integer default 0,
  primary key (user_id)
);

-- RLS setup (example for one table)
alter table public.match_predictions enable row level security;
create policy "Users can view their own predictions" on public.match_predictions for select using (auth.uid() = user_id);
create policy "Users can insert their own predictions" on public.match_predictions for insert with check (auth.uid() = user_id);
-- Add check to prevent update after kickoff in real implementation
create policy "Users can update their own predictions" on public.match_predictions for update using (auth.uid() = user_id);
