import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  BarChart3,
  Tag,
  User,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Course, Module } from '@/lib/supabase';
import { CourseActions } from '@/components/CourseActions';
import { ModuleSidebar } from '@/components/ModuleSidebar';
import { ReviewSection } from '@/components/ReviewSection';
import { ScrollReveal } from '@/components/ScrollReveal';

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const fetchCourse = useCallback(async () => {
    if (!slug) return;
    const { data } = await supabase
      .from('courses')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .maybeSingle();
    const courseData = data as unknown as Course;
    setCourse(courseData);

    if (courseData) {
      const { data: modData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseData.id)
        .order('sort_order');
      setModules(modData || []);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Load completion state from localStorage (per user per course)
  useEffect(() => {
    if (!course || !user) return;
    const key = `completed_${user.id}_${course.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setCompletedIds(new Set(JSON.parse(stored)));
      } catch {
        setCompletedIds(new Set());
      }
    }
  }, [course, user]);

  const toggleComplete = (moduleId: string) => {
    if (!user || !course) return;
    const key = `completed_${user.id}_${course.id}`;
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      localStorage.setItem(key, JSON.stringify([...next]));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neon-indigo animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/40 mb-4">Course not found.</p>
          <Link to="/courses" className="text-neon-indigo hover:underline">
            Browse all courses
          </Link>
        </div>
      </div>
    );
  }

  const currentVideoId =
    modules.length > 0 ? modules[activeModule]?.youtube_video_id : course.youtube_video_id;
  const currentTitle =
    modules.length > 0 ? modules[activeModule]?.title : course.title;

  const embedUrl = `https://www.youtube.com/embed/${currentVideoId}?rel=0&modestbranding=1`;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        {/* Title section */}
        <ScrollReveal direction="up">
          <div className="mb-6">
            {course.category && (
              <Link
                to={`/category/${course.category.slug}`}
                className="text-sm text-neon-indigo font-medium hover:underline mb-2 inline-block"
              >
                {course.category.name}
              </Link>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{course.title}</h1>
            <p className="text-white/50 max-w-3xl leading-relaxed">{course.description}</p>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-4 flex-wrap text-sm text-white/40">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {course.instructor}
              </span>
              {course.duration_text && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {course.duration_text}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                {course.difficulty}
              </span>
              {course.tags.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  {course.tags.join(', ')}
                </span>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Actions bar */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-6">
            <CourseActions courseId={course.id} />
          </div>
        </ScrollReveal>

        {/* Main layout: Video + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Cinema-mode video */}
          <div>
            <div className="relative aspect-video rounded-2xl overflow-hidden glass-card p-0 bg-black">
              <iframe
                key={currentVideoId}
                src={embedUrl}
                title={currentTitle}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Current module title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-3"
              >
                {modules.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <span className="px-2 py-1 rounded-md bg-white/5">
                      Module {activeModule + 1}/{modules.length}
                    </span>
                  </div>
                )}
                <h2 className="text-lg font-semibold text-white">{currentTitle}</h2>
              </motion.div>
            </AnimatePresence>

            {/* Next module button */}
            {modules.length > 0 && activeModule < modules.length - 1 && (
              <button
                onClick={() => setActiveModule(activeModule + 1)}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-indigo/15 border border-neon-indigo/30 text-neon-indigo text-sm font-medium hover:bg-neon-indigo/25 transition-all"
              >
                Next: {modules[activeModule + 1].title}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {modules.length > 0 && activeModule === modules.length - 1 && completedIds.size === modules.length && (
              <div className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-emerald/15 border border-neon-emerald/30 text-neon-emerald text-sm font-medium w-fit">
                <CheckCircle2 className="h-4 w-4" />
                Course completed! Great work.
              </div>
            )}

            {/* Reviews section */}
            <div className="mt-12">
              <ReviewSection courseId={course.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            {modules.length > 0 ? (
              <ModuleSidebar
                modules={modules}
                activeIndex={activeModule}
                onSelect={setActiveModule}
                completedIds={completedIds}
                onToggleComplete={toggleComplete}
              />
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-white/40">
                  This course is a single video. Use the player above to watch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
