'use client'

import React from 'react'
import { format } from 'date-fns'
import { Trophy, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Team {
  id: string
  name: string
  code: string
  flag_emoji: string
}

interface Match {
  id: string
  kickoff_at: string
  venue: string
  competition_stage: string
  home_team: Team
  away_team: Team
  home_score?: number | null
  away_score?: number | null
  winner_team_id?: string | null
  result_confirmed: boolean
}

export default function MatchCard({ 
  match, 
  prediction,
  className
}: { 
  match: Match, 
  prediction?: { home_score: number, away_score: number, winner_id?: string | null, points?: number },
  className?: string
}) {
  const isStarted = new Date(match.kickoff_at) < new Date()
  const isFinished = match.result_confirmed

  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-zinc-50/50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <Clock size={14} />
          {format(new Date(match.kickoff_at), 'MMM d, HH:mm')}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {match.competition_stage.replace('r', 'Round of ')}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="text-3xl">{match.home_team.flag_emoji}</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{match.home_team.code}</span>
          </div>

          {/* Score Area */}
          <div className="flex flex-col items-center justify-center gap-1">
            {isFinished ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{match.home_score}</span>
                <span className="text-zinc-300 dark:text-zinc-700">-</span>
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{match.away_score}</span>
              </div>
            ) : isStarted ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">LIVE</span>
            ) : (
              <span className="text-sm font-medium text-zinc-400 font-mono">VS</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="text-3xl">{match.away_team.flag_emoji}</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{match.away_team.code}</span>
          </div>
        </div>

        {/* Prediction Status */}
        {prediction && (
          <div className="mt-4 flex flex-col gap-2 border-t pt-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-tight text-zinc-500">Your Prediction</span>
              {isFinished && (
                <div className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  prediction.points && prediction.points > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  {prediction.points || 0} PTS
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-400">
              <span>{prediction.home_score}</span>
              <span>-</span>
              <span>{prediction.away_score}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t bg-zinc-50/30 px-3 py-1.5 text-[10px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/20">
        <MapPin size={10} />
        {match.venue}
      </div>
    </div>
  )
}
