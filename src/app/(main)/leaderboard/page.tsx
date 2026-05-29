import { Trophy, TrendingUp, Minus } from "lucide-react";

export default function LeaderboardPage() {
  const mockLeaderboard = [
    { rank: 1, name: "Alex R.", points: 124, trend: "up" },
    { rank: 2, name: "Samira K.", points: 118, trend: "same" },
    { rank: 3, name: "John D.", points: 112, trend: "down" },
    { rank: 4, name: "Emma W.", points: 98, trend: "up" },
    { rank: 5, name: "You", points: 95, trend: "up", isUser: true },
    { rank: 6, name: "Mike T.", points: 80, trend: "down" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Leaderboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Compete against your friends.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col">
          {mockLeaderboard.map((user, idx) => (
            <div 
              key={user.rank} 
              className={`flex items-center justify-between p-4 sm:p-6 ${
                idx !== mockLeaderboard.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/50' : ''
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
                    {user.name}
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
          ))}
        </div>
      </div>
    </div>
  );
}
