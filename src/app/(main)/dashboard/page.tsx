"use client";

import { Trophy, Activity, CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
      </div>

      {/* Hero Stats Card */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-2xl shadow-orange-600/20"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black/10 blur-xl"></div>
        
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-orange-100">Total Points</p>
            <p className="mt-1 text-6xl font-black tracking-tighter">124</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
            <Trophy size={28} className="text-white" />
          </div>
        </div>
        <div className="relative mt-8 flex items-center gap-4 text-sm font-bold">
          <div className="flex items-center gap-2 rounded-full bg-black/20 px-4 py-1.5 backdrop-blur-md">
            <Activity size={16} className="text-orange-200" />
            Global Rank: 42nd
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/matches">
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex h-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-500"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/20">
              <CalendarDays size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Matches</h3>
              <p className="mt-1 text-xs font-medium text-zinc-500">Predict 3 upcoming games</p>
            </div>
          </motion.div>
        </Link>
        <Link href="/groups">
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex h-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-500/20">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Groups</h3>
              <p className="mt-1 text-xs font-medium text-zinc-500">Lock your final rankings</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-xl font-black tracking-tight text-zinc-900 dark:text-white">Recent Results</h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i, index) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 group-hover:bg-green-100 group-hover:text-green-600 dark:bg-zinc-800 dark:group-hover:bg-green-900/30">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="font-black tracking-tight text-zinc-900 dark:text-white">USA 2 - 1 PAR</p>
                  <p className="text-xs font-medium text-zinc-500">Exact Scoreline! (+5 pts)</p>
                </div>
              </div>
              <p className="text-lg font-black text-green-600 dark:text-green-500">+5</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
