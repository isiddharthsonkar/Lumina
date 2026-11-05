import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ReviewCard } from '@/components/ReviewCard';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Star, MessageSquare, Sparkles, LogIn } from 'lucide-react';
import type { Review } from '@/lib/supabase';

export function ReviewSection({ courseId }: { courseId: string }) {
  const { user, profile, signInWithLinkedIn } = useAuth();
  const [topReviews, setTopReviews] = useState<Review[]>([]);
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<'top' | 'latest'>('top');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, headline: '', body: '' });

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from('reviews')
      .select(
        '*, profile:profiles(id, full_name, avatar_url, company_headline)',
      )
      .eq('course_id', courseId)
      .eq('approval_status', 'approved')
      .order('is_top_review', { ascending: false });

    const reviews = (data || []) as unknown as Review[];
    setTopReviews(reviews.filter((r) => r.is_top_review));
    setLatestReviews(
      [...reviews].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    );
  }, [courseId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    await supabase.from('reviews').insert({
      user_id: user.id,
      course_id: courseId,
      rating: reviewForm.rating,
      headline: reviewForm.headline,
      body: reviewForm.body,
      approval_status: 'pending',
    });
    setSubmitting(false);
    setShowWriteModal(false);
    setReviewForm({ rating: 5, headline: '', body: '' });
  };

  const displayed = tab === 'top' ? topReviews : latestReviews;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Learner Reviews</h2>
        {user ? (
          <Button variant="ghost" size="sm" onClick={() => setShowWriteModal(true)}>
            <MessageSquare className="h-4 w-4" />
            Write a Review
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={signInWithLinkedIn}>
            <LogIn className="h-4 w-4" />
            Sign in with LinkedIn to Review
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        <TabButton active={tab === 'top'} onClick={() => setTab('top')}>
          <Sparkles className="h-3.5 w-3.5" />
          Top Reviews
        </TabButton>
        <TabButton active={tab === 'latest'} onClick={() => setTab('latest')}>
          <MessageSquare className="h-3.5 w-3.5" />
          Latest Feed
        </TabButton>
      </div>

      {/* Reviews grid */}
      {displayed.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <MessageSquare className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            No {tab === 'top' ? 'top' : 'latest'} reviews yet. Be the first to share your experience!
          </p>
        </div>
      )}

      {/* Write Review Modal */}
      <Modal open={showWriteModal} onClose={() => setShowWriteModal(false)} title="Write a Review">
        <form onSubmit={handleSubmitReview} className="space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-neon-indigo to-neon-violet flex items-center justify-center text-sm font-bold text-white">
                {(profile?.full_name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{profile?.full_name}</p>
              <p className="text-xs text-white/40">{profile?.company_headline || 'LinkedIn Member'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                  className="p-1"
                >
                  <Star
                    className={`h-7 w-7 transition-all ${
                      n <= reviewForm.rating
                        ? 'text-amber-400 fill-amber-400 scale-110'
                        : 'text-white/20 hover:text-white/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Headline</label>
            <input
              type="text"
              value={reviewForm.headline}
              onChange={(e) => setReviewForm({ ...reviewForm, headline: e.target.value })}
              placeholder="Summarize your experience..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-indigo/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Review</label>
            <textarea
              value={reviewForm.body}
              onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
              rows={4}
              placeholder="Share details about what you learned..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-indigo/50 transition-all resize-none"
            />
          </div>

          <p className="text-xs text-white/40">
            Your review will be submitted for approval before appearing publicly.
          </p>

          <Button type="submit" disabled={submitting} className="w-full" size="lg">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
      }`}
    >
      {children}
    </button>
  );
}
