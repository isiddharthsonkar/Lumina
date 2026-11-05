import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Play,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Award,
  Film,
  Bookmark,
  CheckCircle2,
  Code,
  Brain,
  Palette,
  Cloud,
  Binary,
  BookOpen,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Course, Category } from '@/lib/supabase';
import { CourseCard } from '@/components/CourseCard';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import { Button, LinkButton } from '@/components/Button';
import { PromotionSection } from '@/components/PromotionModal';

export function HomePage({ onPromoteClick }: { onPromoteClick: () => void }) {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ courses: 0, categories: 0, learners: 0 });

  useEffect(() => {
    (async () => {
      const [{ data: courses }, { data: cats }] = await Promise.all([
        supabase
          .from('courses')
          .select('*, category:categories(*)')
          .eq('is_featured', true)
          .order('sort_order'),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      setFeaturedCourses((courses || []) as unknown as Course[]);
      setCategories(cats || []);
      setStats({
        courses: courses?.length || 0,
        categories: cats?.length || 0,
        learners: 12000,
      });
    })();
  }, []);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-8">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Sparkles className="h-4 w-4 text-neon-emerald" />
            <span className="text-sm text-white/70">Curated courses from the world's best</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.05]"
          >
            Learn without
            <br />
            <span className="text-gradient-indigo">distraction.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Lumina brings you hand-picked YouTube courses in a premium, cinema-mode experience.
            No ads. No sidebar noise. Just pure learning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <LinkButton to="/courses" size="lg">
              <Play className="h-5 w-5 fill-white" />
              Start Learning
            </LinkButton>
            <LinkButton to="/categories" variant="ghost" size="lg">
              Explore Categories
              <ArrowRight className="h-5 w-5" />
            </LinkButton>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto"
          >
            <Stat value={`${stats.courses}+`} label="Featured Courses" />
            <Stat value={`${stats.categories}`} label="Categories" />
            <Stat value={`${stats.learners.toLocaleString()}+`} label="Active Learners" />
          </motion.div>
        </motion.div>
      </section>

      {/* Bento Grid - Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why learners choose <span className="text-gradient-indigo">Lumina</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                A premium learning experience designed for focus and depth.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
            {/* Large card - Cinema Mode */}
            <StaggerItem className="md:col-span-2 md:row-span-2">
              <BentoCard className="h-full flex flex-col justify-between overflow-hidden">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-neon-indigo/20 blur-3xl" />
                <div className="relative">
                  <div className="inline-flex p-3 rounded-2xl bg-neon-indigo/10 border border-neon-indigo/20 mb-4">
                    <Film className="h-6 w-6 text-neon-indigo" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Cinema-Mode Player</h3>
                  <p className="text-white/50 max-w-md leading-relaxed">
                    Watch courses in a distraction-free viewport. No recommended videos, no
                    comments, no ads. Just you and the content.
                  </p>
                </div>
                <div className="relative flex items-center gap-2 text-neon-indigo text-sm font-medium mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  Full-screen embedded playback
                </div>
              </BentoCard>
            </StaggerItem>

            {/* Card - No YouTube API */}
            <StaggerItem>
              <BentoCard className="h-full">
                <div className="inline-flex p-2.5 rounded-xl bg-neon-emerald/10 border border-neon-emerald/20 mb-3">
                  <Shield className="h-5 w-5 text-neon-emerald" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Curated & Verified</h3>
                <p className="text-sm text-white/40">Every course is hand-picked by our team.</p>
              </BentoCard>
            </StaggerItem>

            {/* Card - Track Progress */}
            <StaggerItem>
              <BentoCard className="h-full">
                <div className="inline-flex p-2.5 rounded-xl bg-neon-violet/10 border border-neon-violet/20 mb-3">
                  <TrendingUp className="h-5 w-5 text-neon-violet" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Track Progress</h3>
                <p className="text-sm text-white/40">Check off modules as you complete them.</p>
              </BentoCard>
            </StaggerItem>

            {/* Card - Bookmark */}
            <StaggerItem>
              <BentoCard className="h-full">
                <div className="inline-flex p-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 mb-3">
                  <Bookmark className="h-5 w-5 text-neon-cyan" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Save for Later</h3>
                <p className="text-sm text-white/40">Bookmark courses to revisit anytime.</p>
              </BentoCard>
            </StaggerItem>

            {/* Card - LinkedIn Reviews */}
            <StaggerItem>
              <BentoCard className="h-full">
                <div className="inline-flex p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 mb-3">
                  <Award className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Verified Reviews</h3>
                <p className="text-sm text-white/40">LinkedIn-authenticated testimonials.</p>
              </BentoCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal direction="left">
              <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    Featured Courses
                  </h2>
                  <p className="text-white/50">Hand-picked by the Lumina team.</p>
                </div>
                <LinkButton to="/courses" variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </LinkButton>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal direction="right">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Explore by <span className="text-gradient-emerald">Category</span>
                </h2>
                <p className="text-white/50 max-w-xl mx-auto">
                  Find exactly what you're looking for across our curated categories.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <StaggerItem key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="group block glass-card p-6 text-center hover:border-white/20 hover:scale-[1.03] transition-all duration-300"
                  >
                    <div
                      className="inline-flex p-3 rounded-2xl mb-3 border transition-all group-hover:scale-110"
                      style={{
                        background: `${getCategoryColor(cat.color)}15`,
                        borderColor: `${getCategoryColor(cat.color)}30`,
                      }}
                    >
                      <CategoryIcon name={cat.icon_name} />
                    </div>
                    <p className="text-sm font-semibold text-white group-hover:text-neon-indigo transition-colors">
                      {cat.name}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How it <span className="text-gradient-indigo">works</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Sign In', desc: 'Connect with LinkedIn for verified reviews and progress tracking.' },
              { icon: Zap, title: 'Pick a Course', desc: 'Browse curated courses across multiple categories and difficulty levels.' },
              { icon: Film, title: 'Start Watching', desc: 'Enjoy distraction-free cinema mode with module tracking and bookmarks.' },
            ].map((step, i) => (
              <ScrollReveal key={i} direction={i === 0 ? 'left' : i === 1 ? 'up' : 'right'} delay={i * 0.1}>
                <div className="glass-card p-8 text-center h-full">
                  <div className="relative inline-flex mb-4">
                    <div className="absolute inset-0 bg-neon-indigo blur-lg opacity-30" />
                    <div className="relative p-3 rounded-2xl bg-neon-indigo/10 border border-neon-indigo/20">
                      <step.icon className="h-6 w-6 text-neon-indigo" />
                    </div>
                  </div>
                  <div className="text-xs text-white/30 mb-2">STEP {i + 1}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <PromotionSection onPromoteClick={onPromoteClick} />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  );
}

function BentoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card p-6 relative ${className}`}>
      {children}
    </div>
  );
}

function getCategoryColor(color: string): string {
  const colors: Record<string, string> = {
    indigo: '#6366f1',
    violet: '#8b5cf6',
    emerald: '#10b981',
    cyan: '#06b6d4',
    amber: '#f59e0b',
    rose: '#f43f5e',
  };
  return colors[color] || '#6366f1';
}

function CategoryIcon({ name }: { name: string }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Code,
    Brain,
    Palette,
    Cloud,
    Binary,
    BookOpen,
  };
  const Icon = icons[name] || BookOpen;
  return <Icon className="h-5 w-5 text-white" />;
}
