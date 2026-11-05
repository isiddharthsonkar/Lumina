import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Course } from '@/lib/supabase';
import { CourseCard } from '@/components/CourseCard';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Button, LinkButton } from '@/components/Button';

export function BookmarksPage() {
  const { user, loading } = useAuth();
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }
    (async () => {
      const { data: interactions } = await supabase
        .from('course_interactions')
        .select('course:courses(*, category:categories(*))')
        .eq('user_id', user.id)
        .eq('interaction_type', 'bookmark');

      const courses = (interactions || [])
        .map((i) => i.course)
        .filter(Boolean) as unknown as Course[];
      setBookmarkedCourses(courses);
      setLoaded(true);
    })();
  }, [user]);

  if (loading || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-neon-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-10 text-center max-w-md">
          <div className="inline-flex p-4 rounded-2xl bg-neon-emerald/10 border border-neon-emerald/20 mb-6">
            <Bookmark className="h-8 w-8 text-neon-emerald" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Sign in to view bookmarks</h1>
          <p className="text-sm text-white/50 mb-6">
            Save courses and access them anytime from your bookmarks page.
          </p>
          <LinkButton to="/auth" size="lg">
            <LogIn className="h-4 w-4" />
            Sign In
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookmarks</h1>
          <p className="text-white/50 mb-10">Courses you've saved for later.</p>
        </ScrollReveal>

        {bookmarkedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedCourses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center">
            <Bookmark className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 mb-4">No bookmarks yet.</p>
            <Link to="/courses">
              <Button variant="ghost">Browse Courses</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
