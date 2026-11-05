import { motion } from 'framer-motion';
import { Check, Play, Lock } from 'lucide-react';
import type { Module } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function ModuleSidebar({
  modules,
  activeIndex,
  onSelect,
  completedIds,
  onToggleComplete,
}: {
  modules: Module[];
  activeIndex: number;
  onSelect: (index: number) => void;
  completedIds: Set<string>;
  onToggleComplete: (moduleId: string) => void;
}) {
  const { user } = useAuth();

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Course Modules</h3>
        <span className="text-xs text-white/40">
          {completedIds.size}/{modules.length}
        </span>
      </div>
      <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
        {modules.map((mod, i) => {
          const isActive = i === activeIndex;
          const isCompleted = completedIds.has(mod.id);
          return (
            <div
              key={mod.id}
              className={`group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-neon-indigo/15 border border-neon-indigo/30'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
              onClick={() => onSelect(i)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (user) onToggleComplete(mod.id);
                }}
                className={`flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-lg transition-all ${
                  isCompleted
                    ? 'bg-neon-emerald text-white'
                    : 'bg-white/10 text-white/40 group-hover:bg-white/15'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : user ? (
                  <div className="h-3 w-3 rounded-full border-2 border-current" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isActive ? 'text-white' : isCompleted ? 'text-white/50' : 'text-white/80'
                  }`}
                >
                  {mod.title}
                </p>
                {mod.duration_text && (
                  <p className="text-xs text-white/30 mt-0.5">{mod.duration_text}</p>
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeModule"
                  className="flex-shrink-0 p-1 rounded-lg bg-neon-indigo/20"
                >
                  <Play className="h-3 w-3 text-neon-indigo fill-neon-indigo" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
      {!user && (
        <p className="text-xs text-white/30 mt-4 text-center">
          Sign in to track your progress
        </p>
      )}
    </div>
  );
}
