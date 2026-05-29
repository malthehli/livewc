"use client";

import { useAuth } from "@/components/AuthProvider";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { LogOut, Trophy, Activity, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { FIXTURES, getTeam } from "@/lib/data";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Record<string, { home: string, away: string }>>({});
  const [nickname, setNickname] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setNickname(userDocSnap.data().nickname || "");
        }

        const docRef = doc(db, "user_predictions", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPredictions(docSnap.data().matches || {});
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (!user) return null;

  const predictedMatchIds = Object.keys(predictions);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 pb-10"
    >
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your account and view history.</p>
      </div>

      {/* User Card */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <div className="flex h-20 w-20 overflow-hidden rounded-full bg-zinc-100 ring-4 ring-orange-50 dark:bg-zinc-800 dark:ring-orange-900/20">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-black text-zinc-400">
                {user.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
              {nickname || user.displayName || "World Cup Predictor"}
            </h2>
            <p className="text-sm font-medium text-zinc-500">{user.email}</p>
          </div>
        </div>

        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-zinc-200 bg-white py-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-500">
            <Activity size={24} />
          </div>
          <p className="mt-2 text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">{predictedMatchIds.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Matches Predicted</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-zinc-200 bg-white py-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-500">
            <Trophy size={24} />
          </div>
          <p className="mt-2 text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">0</p>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Points</p>
        </div>
      </div>

      {/* History Timeline */}
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-xl font-black tracking-tight text-zinc-900 dark:text-white">
          <CalendarDays className="text-orange-500" /> Prediction History
        </h2>
        
        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
          </div>
        ) : predictedMatchIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
            <p className="font-bold text-zinc-500">No predictions yet.</p>
            <p className="mt-1 text-sm text-zinc-400">Head to the Matches tab to make your first prediction!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {predictedMatchIds.map((matchId) => {
              const fixture = FIXTURES.find(f => f.id === matchId);
              if (!fixture) return null;
              
              const homeTeam = getTeam(fixture.homeTeamId);
              const awayTeam = getTeam(fixture.awayTeamId);
              const pred = predictions[matchId];

              if (!homeTeam || !awayTeam) return null;

              return (
                <div key={matchId} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-4">
                    <div className="flex w-16 flex-col items-center gap-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/w40/${homeTeam.iso2}.png`} alt={homeTeam.code} className="h-4 rounded shadow-sm" />
                      <span className="text-[10px] font-black text-zinc-500">{homeTeam.code}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2 dark:bg-zinc-950">
                      <span className="text-xl font-black text-zinc-900 dark:text-white">{pred.home}</span>
                      <span className="text-sm font-black text-zinc-300 dark:text-zinc-700">-</span>
                      <span className="text-xl font-black text-zinc-900 dark:text-white">{pred.away}</span>
                    </div>

                    <div className="flex w-16 flex-col items-center gap-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/w40/${awayTeam.iso2}.png`} alt={awayTeam.code} className="h-4 rounded shadow-sm" />
                      <span className="text-[10px] font-black text-zinc-500">{awayTeam.code}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-zinc-400">Pending</span>
                    <span className="text-sm font-black text-zinc-300 dark:text-zinc-700">-- pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
