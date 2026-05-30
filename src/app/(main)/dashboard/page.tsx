"use client";

import { Trophy, Activity, CalendarDays, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getLiveWorldCupMatches, LiveMatch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [predictions, setPredictions] = useState<Record<string, { home: string, away: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const liveMatches = await getLiveWorldCupMatches();
        setMatches(liveMatches);

        if (user && liveMatches.length > 0) {
          const docRef = doc(db, "user_predictions", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userMatches = docSnap.data().matches;
            if (userMatches) {
              setPredictions(userMatches);
              
              let calculatedPoints = 0;
              
              // Calculate points across all matches that are final
              liveMatches.forEach(liveMatch => {
                const pred = userMatches[liveMatch.id];
                if (pred && liveMatch.status === 'STATUS_FINAL' && liveMatch.homeScore !== null && liveMatch.awayScore !== null) {
                  const predictedHome = parseInt(pred.home);
                  const predictedAway = parseInt(pred.away);

                  const exactScore = predictedHome === liveMatch.homeScore && predictedAway === liveMatch.awayScore;
                  const predictedGoalDiff = predictedHome - predictedAway;
                  const actualGoalDiff = liveMatch.homeScore - liveMatch.awayScore;
                  
                  const predictedOutcome = predictedGoalDiff > 0 ? 'home' : predictedGoalDiff < 0 ? 'away' : 'draw';
                  let actualOutcome = actualGoalDiff > 0 ? 'home' : actualGoalDiff < 0 ? 'away' : 'draw';
                  if (liveMatch.homeWinner) actualOutcome = 'home';
                  else if (liveMatch.awayWinner) actualOutcome = 'away';

                  if (exactScore) {
                    calculatedPoints += 5; // Example: 5 pts for exact score
                  } else if (predictedOutcome === actualOutcome) {
                    calculatedPoints += 2; // Example: 2 pts for correct outcome
                  }
                }
              });

              setTotalPoints(calculatedPoints);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-zinc-500">
        <Loader2 size={32} className="animate-spin text-orange-500" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

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
            <p className="mt-1 text-6xl font-black tracking-tighter">{totalPoints}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
            <Trophy size={28} className="text-white" />
          </div>
        </div>
        <div className="relative mt-8 flex items-center gap-4 text-sm font-bold">
          <div className="flex items-center gap-2 rounded-full bg-black/20 px-4 py-1.5 backdrop-blur-md">
            <Activity size={16} className="text-orange-200" />
            Live Scoring via ESPN API
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
              <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Live Matches</h3>
              <p className="mt-1 text-xs font-medium text-zinc-500">Predict the World Cup</p>
            </div>
          </motion.div>
        </Link>
        <Link href="/leaderboard">
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex h-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-500/20">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Leaderboard</h3>
              <p className="mt-1 text-xs font-medium text-zinc-500">See live rankings</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-xl font-black tracking-tight text-zinc-900 dark:text-white">Your Predictions</h2>
        {matches.length === 0 ? (
          <div className="text-zinc-500">No active matches found.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map(match => {
              const prediction = predictions[match.id];
              if (!prediction) return null;

              let pointsEarned = 0;
              if (match.status === 'STATUS_FINAL' && match.homeScore !== null && match.awayScore !== null) {
                const predictedHome = parseInt(prediction.home);
                const predictedAway = parseInt(prediction.away);
                const exactScore = predictedHome === match.homeScore && predictedAway === match.awayScore;
                const predictedOutcome = (predictedHome - predictedAway) > 0 ? 'home' : (predictedHome - predictedAway) < 0 ? 'away' : 'draw';
                let actualOutcome = (match.homeScore - match.awayScore) > 0 ? 'home' : (match.homeScore - match.awayScore) < 0 ? 'away' : 'draw';
                if (match.homeWinner) actualOutcome = 'home';
                else if (match.awayWinner) actualOutcome = 'away';

                if (exactScore) pointsEarned = 5;
                else if (predictedOutcome === actualOutcome) pointsEarned = 2;
              }

              return (
                <motion.div 
                  key={match.id}
                  className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      match.status === 'STATUS_FINAL' && pointsEarned > 0 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                    }`}>
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="font-black tracking-tight text-zinc-900 dark:text-white">
                        {match.homeTeam} {prediction.home} - {prediction.away} {match.awayTeam}
                      </p>
                      <p className="text-xs font-medium text-zinc-500">
                        {match.status === 'STATUS_FINAL' 
                          ? (pointsEarned === 5 ? "Exact Scoreline!" : pointsEarned === 2 ? "Correct Outcome" : "Incorrect Prediction")
                          : "Awaiting final result..."}
                      </p>
                    </div>
                  </div>
                  <p className={`text-lg font-black ${pointsEarned > 0 ? 'text-green-600 dark:text-green-500' : 'text-zinc-500'}`}>
                    +{pointsEarned}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
