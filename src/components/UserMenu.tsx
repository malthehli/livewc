"use client";

import { useAuth } from "./AuthProvider";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon, Settings, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-transparent transition-all hover:border-orange-200 focus:border-orange-500 focus:outline-none dark:hover:border-orange-900"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-200 font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {user.email?.[0].toUpperCase()}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
              <p className="truncate text-sm font-black text-zinc-900 dark:text-white">
                {user.displayName || "Player"}
              </p>
              <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
            
            <div className="p-2">
              <Link 
                href="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-orange-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-500"
              >
                <UserIcon size={18} /> Profile
              </Link>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  // Optionally add a real settings page later
                  alert("Settings coming soon!");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <Settings size={18} /> Settings
              </button>
            </div>
            
            <div className="border-t border-zinc-100 p-2 dark:border-zinc-800">
              <button 
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
