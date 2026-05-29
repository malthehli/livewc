"use client";

import { Trophy, TrendingUp, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FIXTURES } from "@/lib/data";
import { calculateMatchPoints, MatchStage } from "@/lib/scoring";
import { useAuth } from "@/components/AuthProvider";

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  trend: string;
  isUser: boolean;
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const predictionsSnap = await getDocs(collection(db, "user_predictions"));

        const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const predictionsData = predictionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const calculatedUsers = usersData.map(user => {
          let totalPoints = 0;
          const userPred = predictionsData.find(p => p.id === user.id);
          
          if (userPred && (userPred as any).matches) {
            FIXTURES.forEach(fixture => {
              if (fixture.homeScore !== null && fixture.awayScore !== null) {
                const pred = (userPred as any).matches[fixture.id];
                if (pred && pred.home !== "" && pred.away !== "") {
                  const stage = fixture.stage.toLowerCase() as MatchStage;
                  const points = calculateMatchPoints(
                    stage,
                    { homeScore: fixture.homeScore, awayScore: fixture.awayScore, winnerId: null },
                    { homeScore: parseInt(pred.home), awayScore: parseInt(pred.away), winnerId: null }
                  );
                  totalPoints += points;
                }
              }
            });
          }

          return {
            id: user.id,
            name: (user as any).email?.split('@')[0] || "Unknown",
            points: totalPoints,
            trend: "same",
            isUser: currentUser?.uid === user.id
          };
        });

        // Sort by points descending
        calculatedUsers.sort((a, b) => b.points - a.points);
        
        // Assign ranks
        const rankedUsers = calculatedUsers.map((u, index) => ({
          ...u,
          rank: index + 1
        }));

        setLeaderboard(rankedUsers);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <p>Calculating live leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Leaderboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Compete against your friends.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No users found yet. Invite some friends!</div>
          ) : (
            leaderboard.map((user, idx) => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-4 sm:p-6 ${
                  idx !== leaderboard.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/50' : ''
                } ${user.isUser ? 'bg-orange-50 dark:bg-orange-500/10' : ''}`}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-black ${
                    user.rank === 1 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500' :
                    user.rank === 2 ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' :
                    user.rank === 3 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-500' :
                    'bg-zinc-50 text-zinc-400 dark:bg-zinc-950/50 dark:text-zinc-500'
                  }`}>
                    {user.rank}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={`font-bold ${user.isUser ? 'text-orange-600 dark:text-orange-500' : 'text-zinc-900 dark:text-white'}`}>
                      {user.name} {user.isUser && "(You)"}
                    </span>
                    <span className="text-xs font-medium text-zinc-500">
                      {user.points} pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">{user.points}</span>
                  {user.trend === 'up' && <TrendingUp size={20} className="text-green-500" />}
                  {user.trend === 'down' && <TrendingUp size={20} className="rotate-180 text-red-500" />}
                  {user.trend === 'same' && <Minus size={20} className="text-zinc-400" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
