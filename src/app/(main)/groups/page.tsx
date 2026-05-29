"use client";

import { TEAMS } from "@/lib/data";
import { motion } from "framer-motion";
import { GroupRanking } from "@/components/GroupRanking";
import { useState, useEffect } from "react";

export default function GroupsPage() {
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Group Rankings</h1>
        <p className="mt-1 text-sm font-medium text-zinc-500">Drag and drop teams to predict the exact final standings.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, index) => {
          const groupTeams = TEAMS.filter(t => t.group === group);
          
          return (
            <motion.div
              key={group}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <GroupRanking group={group} initialTeams={groupTeams} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
