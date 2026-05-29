"use client";

import { Team } from "@/lib/data";
import { Save, GripVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTeam({ team, index }: { team: Team, index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-2xl p-3 transition-colors ${
        isDragging ? 'bg-orange-50 shadow-md ring-1 ring-orange-500/50 dark:bg-orange-500/10' : 'bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="flex cursor-grab items-center justify-center text-zinc-400 hover:text-zinc-600 active:cursor-grabbing dark:text-zinc-600 dark:hover:text-zinc-400"
        >
          <GripVertical size={20} />
        </div>

        <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black shrink-0 ${
          index === 0 ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-500" :
          index === 1 ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-500" :
          "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        }`}>
          {index + 1}
        </div>
        
        <div className="flex h-6 w-8 overflow-hidden rounded shadow-sm shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://flagcdn.com/w40/${team.iso2}.png`} alt={team.name} className="h-full w-full object-cover" />
        </div>
        <span className="font-bold tracking-tight text-zinc-900 dark:text-white">{team.name}</span>
      </div>
      <span className="text-xs font-black tracking-widest text-zinc-400">{team.code}</span>
    </div>
  );
}

export function GroupRanking({ group, initialTeams }: { group: string, initialTeams: Team[] }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>(initialTeams);

  // Load from Firebase
  useEffect(() => {
    const fetchRankings = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "user_group_rankings", `${user.uid}_${group}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const savedOrderIds: string[] = docSnap.data().orderedTeamIds;
          const sortedTeams = [...initialTeams].sort((a, b) => {
             return savedOrderIds.indexOf(a.id) - savedOrderIds.indexOf(b.id);
          });
          setTeams(sortedTeams);
        }
      } catch (e) {
        console.error("Error fetching group ranking from Firebase:", e);
      }
    };
    fetchRankings();
  }, [group, initialTeams, user]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTeams((items) => {
        const oldIndex = items.findIndex(t => t.id === active.id);
        const newIndex = items.findIndex(t => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save predictions.");
      return;
    }

    const orderIds = teams.map(t => t.id);
    
    try {
      const docRef = doc(db, "user_group_rankings", `${user.uid}_${group}`);
      await setDoc(docRef, { orderedTeamIds: orderIds, userId: user.uid, group }, { merge: true });
      
      toast.success(`Group ${group} Saved to Cloud!`, {
        description: `${teams[0].name} predicted to finish 1st.`
      });
    } catch (error: any) {
      toast.error(`Failed to save Group ${group}`, {
        description: error.message
      });
    }
  };

  return (
    <div className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-4 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/50">
        <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Group {group}</h2>
      </div>
      
      <div className="flex flex-col p-3">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={teams.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {teams.map((team, index) => (
              <SortableTeam key={team.id} team={team} index={index} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/50">
        <motion.button 
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-100 px-4 py-3 text-sm font-black text-orange-600 transition-all hover:bg-orange-200 dark:bg-orange-500/10 dark:text-orange-500 dark:hover:bg-orange-500/20"
        >
          <Save size={18} /> Save Rankings
        </motion.button>
      </div>
    </div>
  );
}
