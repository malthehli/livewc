'use client'

import React, { useState } from 'react'
import { submitMatchPrediction } from '@/lib/actions/predictions'
import { cn } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'

interface PredictionInputProps {
  matchId: string
  initialHome?: number | null
  initialAway?: number | null
  isKnockout?: boolean
  initialWinnerId?: string | null
  homeTeam: { id: string, code: string, name: string }
  awayTeam: { id: string, code: string, name: string }
  disabled?: boolean
}

export default function PredictionInput({
  matchId,
  initialHome,
  initialAway,
  isKnockout,
  initialWinnerId,
  homeTeam,
  awayTeam,
  disabled
}: PredictionInputProps) {
  const [homeScore, setHomeScore] = useState(initialHome?.toString() || '')
  const [awayScore, setAwayScore] = useState(initialAway?.toString() || '')
  const [winnerId, setWinnerId] = useState(initialWinnerId || '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (disabled) return
    
    setStatus('loading')
    const formData = new FormData()
    formData.append('matchId', matchId)
    formData.append('homeScore', homeScore)
    formData.append('awayScore', awayScore)
    if (isKnockout) formData.append('winnerId', winnerId)

    try {
      await submitMatchPrediction(formData)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-4">
        {/* Home Score */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min="0"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            disabled={disabled}
            className="h-12 w-12 rounded-xl border border-zinc-200 bg-zinc-50 text-center text-xl font-bold transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="0"
          />
          <span className="text-[10px] font-bold text-zinc-400">{homeTeam.code}</span>
        </div>

        <div className="text-2xl font-black text-zinc-300">:</div>

        {/* Away Score */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            disabled={disabled}
            className="h-12 w-12 rounded-xl border border-zinc-200 bg-zinc-50 text-center text-xl font-bold transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="0"
          />
          <span className="text-[10px] font-bold text-zinc-400">{awayTeam.code}</span>
        </div>
      </div>

      {isKnockout && (homeScore === awayScore && homeScore !== '') && (
        <div className="flex flex-col gap-2">
          <span className="text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">Who advances?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWinnerId(homeTeam.id)}
              disabled={disabled}
              className={cn(
                "flex-1 rounded-lg border py-2 text-xs font-bold transition-all",
                winnerId === homeTeam.id 
                  ? "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/30" 
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
              )}
            >
              {homeTeam.name}
            </button>
            <button
              type="button"
              onClick={() => setWinnerId(awayTeam.id)}
              disabled={disabled}
              className={cn(
                "flex-1 rounded-lg border py-2 text-xs font-bold transition-all",
                winnerId === awayTeam.id 
                  ? "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/30" 
                  : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
              )}
            >
              {awayTeam.name}
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || status === 'loading' || homeScore === '' || awayScore === ''}
        className={cn(
          "flex h-10 items-center justify-center gap-2 rounded-xl font-bold text-white transition-all",
          status === 'loading' ? "bg-zinc-400" :
          status === 'success' ? "bg-green-500" :
          status === 'error' ? "bg-red-500" :
          "bg-gradient-to-tr from-orange-600 to-orange-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:scale-100"
        )}
      >
        {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> :
         status === 'success' ? <Check size={18} /> :
         status === 'error' ? "Error" : "Save Prediction"}
      </button>
    </form>
  )
}
