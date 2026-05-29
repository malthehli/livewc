"use client";

import { Lock, Save, UserX, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { getLiveWorldCupMatches, LiveMatch } from "@/lib/api";

export default function MatchesPage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Record<string, { home: string, away: string }>>({});
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Firebase on mount
  useEffect(() => {
    const fetchPredictionsAndMatch = async () => {
      try {
        const liveMatches = await getLiveWorldCupMatches();
        setMatches(liveMatches);

        if (user) {
          const docRef = doc(db, "user_predictions", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPredictions(docSnap.data().matches || {});
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictionsAndMatch();
  }, [user]);

  const handleScoreChange = (matchId: string, team: 'home' | 'away', value: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value
      }
    }));
  };

  const handleSave = async (matchId: string) => {
    if (!user) {
      toast.error("You must be logged in to save predictions.");
      return;
    }
    const p = predictions[matchId];
    if (!p || p.home === "" || p.away === "") {
      toast.error("Please enter a valid score before saving.");
      return;
    }
    
    try {
      const docRef = doc(db, "user_predictions", user.uid);
      await setDoc(docRef, { matches: predictions }, { merge: true });
      
      toast.success("Prediction Saved to Cloud!", {
        description: `Your scoreline of ${p.home} - ${p.away} is locked in Firebase.`
      });
    } catch (error: any) {
      toast.error("Failed to save to Firebase", {
        description: error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-zinc-500">
        <Loader2 size={32} className="animate-spin text-orange-500" />
        <p>Fetching live matches from ESPN API...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
        <UserX size={48} className="mb-4 opacity-50" />
        <p>Please log in to predict matches.</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
        <p>No active matches found.</p>
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
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Champions league Final</h1>
        <p className="mt-1 text-sm text-zinc-500">Predict the exact score before kickoff!</p>
      </div>

      <div className="flex flex-col gap-6">
        {matches.map((match, index) => {
          const date = new Date(match.date);
          const isLocked = new Date() > date;

          return (
            <motion.div 
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className={`overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 ${
                !isLocked ? "hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10" : ""
              }`}
            >
              {/* Match Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-5 py-3 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/50">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">ESPN API LIVE</span>
                <span className="text-xs font-bold text-zinc-500">
                  {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isLocked ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-600 dark:bg-red-500/20 dark:text-red-500">
                    <Lock size={12} /> Locked
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-600 dark:bg-green-500/20 dark:text-green-500">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </span>
                    Open
                  </span>
                )}
              </div>

              {/* Match Body */}
              <div className="flex items-center justify-between p-6 sm:p-8">
                {/* Home */}
                <div className="flex w-1/3 flex-col items-center gap-3">
                  <div className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-2xl bg-zinc-100 shadow-inner dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={match.homeLogo} alt={match.homeTeam} className="h-full w-full object-contain p-2" />
                  </div>
                  <span className="text-center text-sm font-black tracking-tight text-zinc-900 dark:text-white sm:text-lg">{match.homeTeam}</span>
                </div>

                {/* Score inputs */}
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="0"
                      disabled={isLocked}
                      placeholder="-"
                      value={predictions[match.id]?.home || ""}
                      onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                      className="h-14 w-14 rounded-2xl border-2 border-zinc-200 bg-zinc-50 text-center text-2xl font-black text-zinc-900 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:dark:bg-zinc-900 sm:h-16 sm:w-16 sm:text-3xl"
                    />
                    <span className="text-2xl font-black text-zinc-300 dark:text-zinc-700">-</span>
                    <input
                      type="number"
                      min="0"
                      disabled={isLocked}
                      placeholder="-"
                      value={predictions[match.id]?.away || ""}
                      onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                      className="h-14 w-14 rounded-2xl border-2 border-zinc-200 bg-zinc-50 text-center text-2xl font-black text-zinc-900 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:dark:bg-zinc-900 sm:h-16 sm:w-16 sm:text-3xl"
                    />
                  </div>
                  {match.status === 'STATUS_FINAL' && match.homeScore !== null && (
                    <div className="mt-2 text-xs font-bold text-green-500">
                      Actual: {match.homeScore} - {match.awayScore}
                    </div>
                  )}
                </div>

                {/* Away */}
                <div className="flex w-1/3 flex-col items-center gap-3">
                  <div className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-2xl bg-zinc-100 shadow-inner dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={match.awayLogo} alt={match.awayTeam} className="h-full w-full object-contain p-2" />
                  </div>
                  <span className="text-center text-sm font-black tracking-tight text-zinc-900 dark:text-white sm:text-lg">{match.awayTeam}</span>
                </div>
              </div>

              {/* Action */}
              {!isLocked && (
                <div className="flex justify-end border-t border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/50">
                  <motion.button 
                    onClick={() => handleSave(match.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-500"
                  >
                    <Save size={16} /> Save Prediction
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
