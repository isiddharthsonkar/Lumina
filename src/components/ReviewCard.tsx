import { motion } from 'framer-motion';
import { Star, BadgeCheck } from 'lucide-react';
import type { Review } from '@/lib/supabase';

export function ReviewCard({ review, index = 0 }: { review: Review; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="glass-card p-6 hover:border-white/15 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.profile?.avatar_url ? (
            <img
              src={review.profile.avatar_url}
              alt=""
              className="h-11 w-11 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-neon-indigo to-neon-violet flex items-center justify-center text-sm font-bold text-white">
              {(review.profile?.full_name || 'A')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white">
                {review.profile?.full_name || 'Anonymous'}
              </p>
              <BadgeCheck className="h-4 w-4 text-neon-indigo" />
            </div>
            <p className="text-xs text-white/40">{review.profile?.company_headline || 'LinkedIn Member'}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`h-3.5 w-3.5 ${
                n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/15'
              }`}
            />
          ))}
        </div>
      </div>
      {review.headline && (
        <h4 className="text-sm font-semibold text-white mb-2">{review.headline}</h4>
      )}
      {review.body && (
        <p className="text-sm text-white/60 leading-relaxed">{review.body}</p>
      )}
    </motion.div>
  );
}
