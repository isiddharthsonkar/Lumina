import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Filter, ArrowLeft, Code, Brain, Palette, Cloud, Binary, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Course, Category } from '@/lib/supabase';
import { CourseCard } from '@/components/CourseCard';
import { ScrollReveal } from '@/components/ScrollReveal';

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: courseData }, { data: catData }] = await Promise.all([
        supabase
          .from('courses')
          .select('*, category:categories(*)')
          .order('sort_order'),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      setCourses((courseData || []) as unknown as Course[]);
      setCategories(catData || []);
      setLoading(false);
    })();
  }, []);

  const filtered = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCat === 'all' || c.category?.slug === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <h1 className="text-4xl font-bold text-white mb-2">All Courses</h1>
          <p className="text-white/50 mb-8">
            Browse our full library of curated courses.
          </p>
        </ScrollReveal>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, instructors, tags..."
              className="w-full pl-12 pr-4 py-3 rounded-xl glass text-white placeholder-white/30 focus:outline-none focus:border-neon-indigo/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <FilterChip active={selectedCat === 'all'} onClick={() => setSelectedCat('all')}>
              All
            </FilterChip>
            {categories.map((cat) => (
              <FilterChip
                key={cat.id}
                active={selectedCat === cat.slug}
                onClick={() => setSelectedCat(cat.slug)}
              >
                {cat.name}
              </FilterChip>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="aspect-video rounded-xl bg-white/5 mb-4" />
                <div className="h-4 bg-white/5 rounded mb-2" />
                <div className="h-4 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center">
            <Filter className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No courses found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courseCounts, setCourseCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      setCategories(cats || []);

      const { data: courses } = await supabase.from('courses').select('category_id');
      const counts: Record<string, number> = {};
      (courses || []).forEach((c: { category_id: string | null }) => {
        if (c.category_id) counts[c.category_id] = (counts[c.category_id] || 0) + 1;
      });
      setCourseCounts(counts);
    })();
  }, []);

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <h1 className="text-4xl font-bold text-white mb-2">Categories</h1>
          <p className="text-white/50 mb-10">Explore courses by topic.</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.id} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.05}>
              <Link
                to={`/category/${cat.slug}`}
                className="group block glass-card p-8 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="inline-flex p-3 rounded-2xl border transition-all group-hover:scale-110"
                    style={{
                      background: `${getCategoryColor(cat.color)}15`,
                      borderColor: `${getCategoryColor(cat.color)}30`,
                    }}
                  >
                    <CategoryIcon name={cat.icon_name} color={getCategoryColor(cat.color)} />
                  </div>
                  <span className="text-xs text-white/30 px-2 py-1 rounded-md bg-white/5">
                    {courseCounts[cat.id] || 0} courses
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-indigo transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">{cat.description}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategory = useCallback(async () => {
    if (!slug) return;
    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    setCategory(cat as Category | null);

    if (cat) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*, category:categories(*)')
        .eq('category_id', cat.id)
        .order('sort_order');
      setCourses((courseData || []) as unknown as Course[]);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  if (!loading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/40 mb-4">Category not found.</p>
          <Link to="/categories" className="text-neon-indigo hover:underline">
            Browse all categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </Link>

        {loading ? (
          <div className="h-8 w-64 bg-white/5 rounded animate-pulse mb-8" />
        ) : (
          <>
            <div className="flex items-center gap-4 mb-10">
              <div
                className="inline-flex p-3 rounded-2xl border"
                style={{
                  background: `${getCategoryColor(category!.color)}15`,
                  borderColor: `${getCategoryColor(category!.color)}30`,
                }}
              >
                <CategoryIcon name={category!.icon_name} color={getCategoryColor(category!.color)} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{category!.name}</h1>
                <p className="text-white/50">{category!.description}</p>
              </div>
            </div>
          </>
        )}

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="glass-card p-16 text-center">
              <p className="text-white/40">No courses in this category yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function FilterChip({
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
      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
        active
          ? 'bg-neon-indigo/15 border border-neon-indigo/30 text-white'
          : 'glass text-white/50 hover:text-white'
      }`}
    >
      {children}
    </button>
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

function CategoryIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    Code,
    Brain,
    Palette,
    Cloud,
    Binary,
    BookOpen,
  };
  const Icon = icons[name] || BookOpen;
  return <Icon className="h-5 w-5" style={{ color }} />;
}
