'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setLocalUser } from '@/lib/local-auth'
import { Trophy, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setLocalUser(name.trim())
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-yellow-500 text-white shadow-lg shadow-orange-500/20">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">World Cup 2026</h1>
          <p className="mt-2 text-sm font-medium text-zinc-500">Enter your name to start predicting</p>
        </div>

        <form onSubmit={handleStart} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Your Name</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-lg font-bold transition-all focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="e.g. Alex"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3 font-bold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-500 active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Get Started
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          No account needed — just enter your name and go!
        </p>
      </div>
    </div>
  )
}
