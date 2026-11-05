import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Bookmark, Share2, Check, Link2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { InteractionType } from '@/lib/supabase';

export function CourseActions({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Set<InteractionType>>(new Set());
  const [counts, setCounts] = useState({ like: 0, dislike: 0, bookmark: 0 });
  const [shareCopied, setShareCopied] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const fetchInteractions = useCallback(async () => {
    const [allRes, mineRes] = await Promise.all([
      supabase
        .from('course_interactions')
        .select('interaction_type')
        .eq('course_id', courseId),
      user
        ? supabase
            .from('course_interactions')
            .select('interaction_type')
            .eq('course_id', courseId)
            .eq('user_id', user.id)
        : Promise.resolve({ data: null, error: null }),
    ]);

    const countsMap = { like: 0, dislike: 0, bookmark: 0 };
    (allRes.data || []).forEach((r: { interaction_type: InteractionType }) => {
      countsMap[r.interaction_type]++;
    });
    setCounts(countsMap);

    const mine = new Set<InteractionType>();
    (mineRes.data || []).forEach((r: { interaction_type: InteractionType }) => {
      mine.add(r.interaction_type);
    });
    setInteractions(mine);
  }, [courseId, user]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const toggleInteraction = async (type: InteractionType) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const has = interactions.has(type);

    // Optimistic update
    setInteractions((prev) => {
      const next = new Set(prev);
      if (has) next.delete(type);
      else next.add(type);
      return next;
    });
    setCounts((prev) => ({
      ...prev,
      [type]: prev[type] + (has ? -1 : 1),
    }));

    // If liking, remove dislike; if disliking, remove like
    let removedType: InteractionType | null = null;
    if (type === 'like' && interactions.has('dislike')) removedType = 'dislike';
    if (type === 'dislike' && interactions.has('like')) removedType = 'like';

    if (removedType) {
      setInteractions((prev) => {
        const next = new Set(prev);
        next.delete(removedType!);
        return next;
      });
      setCounts((prev) => ({ ...prev, [removedType as string]: prev[removedType as 'like' | 'dislike'] - 1 }));
      await supabase
        .from('course_interactions')
        .delete()
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .eq('interaction_type', removedType);
    }

    if (has) {
      await supabase
        .from('course_interactions')
        .delete()
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .eq('interaction_type', type);
    } else {
      await supabase.from('course_interactions').insert({
        course_id: courseId,
        user_id: user.id,
        interaction_type: type,
      });
    }

    fetchInteractions();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/course/${courseId}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // fallback
      window.prompt('Copy this link:', url);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        <ActionButton
          icon={ThumbsUp}
          label={counts.like.toString()}
          active={interactions.has('like')}
          activeColor="text-neon-indigo border-neon-indigo/40 bg-neon-indigo/10"
          onClick={() => toggleInteraction('like')}
        />
        <ActionButton
          icon={ThumbsDown}
          label={counts.dislike.toString()}
          active={interactions.has('dislike')}
          activeColor="text-red-400 border-red-400/40 bg-red-400/10"
          onClick={() => toggleInteraction('dislike')}
        />
        <ActionButton
          icon={Bookmark}
          label={counts.bookmark.toString()}
          active={interactions.has('bookmark')}
          activeColor="text-neon-emerald border-neon-emerald/40 bg-neon-emerald/10"
          onClick={() => toggleInteraction('bookmark')}
        />
        <ActionButton
          icon={shareCopied ? Check : Share2}
          label={shareCopied ? 'Copied!' : 'Share'}
          active={shareCopied}
          activeColor="text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10"
          onClick={handleShare}
        />
      </div>

      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 px-4 py-2.5 rounded-xl glass-strong text-sm text-white/80 whitespace-nowrap z-10"
          >
            <Link2 className="inline h-4 w-4 mr-1.5 text-neon-indigo" />
            Please sign in to interact with courses.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  activeColor,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  activeColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
        active
          ? activeColor
          : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
