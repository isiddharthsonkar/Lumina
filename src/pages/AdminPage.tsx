import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderTree,
  BookOpen,
  ListOrdered,
  Star,
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Category, Course, Module, Review, Promotion } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';

type Tab = 'dashboard' | 'categories' | 'courses' | 'modules' | 'reviews' | 'promotions';

export function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neon-indigo animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'modules', label: 'Modules', icon: ListOrdered },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'promotions', label: 'Promotions', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-sm text-white/50">Manage your platform content and requests.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar tabs */}
          <div className="glass-card p-3 h-fit lg:sticky lg:top-24">
            <div className="flex lg:flex-col gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    tab === t.id
                      ? 'bg-neon-indigo/15 text-neon-indigo border border-neon-indigo/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'dashboard' && <DashboardTab />}
                {tab === 'categories' && <CategoriesTab />}
                {tab === 'courses' && <CoursesTab />}
                {tab === 'modules' && <ModulesTab />}
                {tab === 'reviews' && <ReviewsTab />}
                {tab === 'promotions' && <PromotionsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function DashboardTab() {
  const [stats, setStats] = useState({
    categories: 0,
    courses: 0,
    modules: 0,
    pendingReviews: 0,
    newPromotions: 0,
  });

  useEffect(() => {
    (async () => {
      const [cats, courses, mods, reviews, promos] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('modules').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
        supabase.from('promotions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      ]);
      setStats({
        categories: cats.count || 0,
        courses: courses.count || 0,
        modules: mods.count || 0,
        pendingReviews: reviews.count || 0,
        newPromotions: promos.count || 0,
      });
    })();
  }, []);

  const colorMap: Record<string, string> = {
    indigo: '#6366f1',
    emerald: '#10b981',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    cyan: '#06b6d4',
  };

  const cards = [
    { label: 'Categories', value: stats.categories, icon: FolderTree, color: 'indigo' },
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'emerald' },
    { label: 'Modules', value: stats.modules, icon: ListOrdered, color: 'violet' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Star, color: 'amber' },
    { label: 'New Promotions', value: stats.newPromotions, icon: Megaphone, color: 'cyan' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((c) => {
        const hex = colorMap[c.color] || '#6366f1';
        return (
          <div key={c.label} className="glass-card p-6">
            <div
              className="inline-flex p-2.5 rounded-xl mb-3 border"
              style={{ background: `${hex}1a`, borderColor: `${hex}33` }}
            >
              <c.icon className="h-5 w-5" style={{ color: hex }} />
            </div>
            <p className="text-3xl font-bold text-white">{c.value}</p>
            <p className="text-sm text-white/40 mt-1">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// CATEGORIES CRUD
// ============================================================
function CategoriesTab() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Courses in it will keep their data.')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetch();
  };

  return (
    <div>
      <SectionHeader title="Categories" onAdd={() => { setEditing(null); setShowForm(true); }} />
      {loading ? <Spinner /> : (
        <div className="space-y-2">
          {items.map((cat) => (
            <Row key={cat.id}>
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `${({ indigo: '#6366f1', violet: '#8b5cf6', emerald: '#10b981', cyan: '#06b6d4', amber: '#f59e0b', rose: '#f43f5e' })[cat.color] || '#6366f1'}1a` }}
                >
                  <FolderTree className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{cat.name}</p>
                  <p className="text-xs text-white/40">/{cat.slug}</p>
                </div>
              </div>
              <RowActions onEdit={() => { setEditing(cat); setShowForm(true); }} onDelete={() => handleDelete(cat.id)} />
            </Row>
          ))}
          {items.length === 0 && <Empty text="No categories yet." />}
        </div>
      )}
      {showForm && <CategoryForm existing={editing} onClose={() => { setShowForm(false); fetch(); }} />}
    </div>
  );
}

function CategoryForm({ existing, onClose }: { existing: Category | null; onClose: () => void }) {
  const [form, setForm] = useState({
    name: existing?.name || '',
    slug: existing?.slug || '',
    description: existing?.description || '',
    icon_name: existing?.icon_name || 'BookOpen',
    color: existing?.color || 'indigo',
    sort_order: existing?.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (existing) {
      await supabase.from('categories').update(form).eq('id', existing.id);
    } else {
      await supabase.from('categories').insert({ ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') });
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={existing ? 'Edit Category' : 'New Category'}>
      <FormGrid onSubmit={handleSave} saving={saving}>
        <FormField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <FormField label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />
        <FormField label="Icon Name" value={form.icon_name} onChange={(v) => setForm({ ...form, icon_name: v })} />
        <FormField label="Color" value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
        <FormField label="Sort Order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: parseInt(v) || 0 })} type="number" />
        <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} full />
      </FormGrid>
    </Modal>
  );
}

// ============================================================
// COURSES CRUD
// ============================================================
function CoursesTab() {
  const [items, setItems] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = useCallback(async () => {
    const [{ data: courses }, { data: cats }] = await Promise.all([
      supabase.from('courses').select('*, category:categories(*)').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    setItems((courses || []) as unknown as Course[]);
    setCategories(cats || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course and all its modules?')) return;
    await supabase.from('courses').delete().eq('id', id);
    fetch();
  };

  return (
    <div>
      <SectionHeader title="Courses" onAdd={() => { setEditing(null); setShowForm(true); }} />
      {loading ? <Spinner /> : (
        <div className="space-y-2">
          {items.map((course) => (
            <Row key={course.id}>
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={`https://img.youtube.com/vi/${course.youtube_video_id}/default.jpg`}
                  alt=""
                  className="h-10 w-16 rounded object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{course.title}</p>
                  <p className="text-xs text-white/40 truncate">
                    {course.category?.name || 'Uncategorized'} • {course.instructor}
                  </p>
                </div>
              </div>
              <RowActions onEdit={() => { setEditing(course); setShowForm(true); }} onDelete={() => handleDelete(course.id)} />
            </Row>
          ))}
          {items.length === 0 && <Empty text="No courses yet." />}
        </div>
      )}
      {showForm && <CourseForm existing={editing} categories={categories} onClose={() => { setShowForm(false); fetch(); }} />}
    </div>
  );
}

function CourseForm({ existing, categories, onClose }: { existing: Course | null; categories: Category[]; onClose: () => void }) {
  const [form, setForm] = useState({
    title: existing?.title || '',
    slug: existing?.slug || '',
    description: existing?.description || '',
    youtube_video_id: existing?.youtube_video_id || '',
    category_id: existing?.category_id || '',
    thumbnail_url: existing?.thumbnail_url || '',
    instructor: existing?.instructor || '',
    difficulty: existing?.difficulty || 'Beginner',
    duration_text: existing?.duration_text || '',
    tags: (existing?.tags || []).join(', '),
    is_featured: existing?.is_featured || false,
    sort_order: existing?.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      category_id: form.category_id || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    if (existing) {
      await supabase.from('courses').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('courses').insert(payload);
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={existing ? 'Edit Course' : 'New Course'} maxWidth="max-w-2xl">
      <FormGrid onSubmit={handleSave} saving={saving}>
        <FormField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <FormField label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />
        <FormField label="YouTube Video ID" value={form.youtube_video_id} onChange={(v) => setForm({ ...form, youtube_video_id: v })} placeholder="dQw4w9WgXcQ" />
        <FormField label="Instructor" value={form.instructor} onChange={(v) => setForm({ ...form, instructor: v })} />
        <FormField label="Difficulty" value={form.difficulty} onChange={(v) => setForm({ ...form, difficulty: v })} />
        <FormField label="Duration" value={form.duration_text} onChange={(v) => setForm({ ...form, duration_text: v })} placeholder="10 hours" />
        <FormField label="Thumbnail URL" value={form.thumbnail_url} onChange={(v) => setForm({ ...form, thumbnail_url: v })} placeholder="auto from YouTube" />
        <FormField label="Sort Order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: parseInt(v) || 0 })} type="number" />
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Category</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-indigo/50"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <FormField label="Tags (comma-separated)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
        <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} full textarea />
        <label className="flex items-center gap-2 text-sm text-white/80 sm:col-span-2">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-neon-indigo" />
          Featured course
        </label>
      </FormGrid>
    </Modal>
  );
}

// ============================================================
// MODULES CRUD
// ============================================================
function ModulesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Module | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('courses').select('id, title').order('title');
      setCourses((data || []) as unknown as Course[]);
      setLoading(false);
    })();
  }, []);

  const fetchModules = useCallback(async () => {
    if (!selectedCourse) return;
    const { data } = await supabase.from('modules').select('*').eq('course_id', selectedCourse).order('sort_order');
    setModules(data || []);
  }, [selectedCourse]);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this module?')) return;
    await supabase.from('modules').delete().eq('id', id);
    fetchModules();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-white">Modules</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-indigo/50"
          >
            <option value="">Select a course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          {selectedCourse && (
            <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="h-4 w-4" /> Add Module
            </Button>
          )}
        </div>
      </div>

      {!selectedCourse ? (
        <Empty text="Select a course to manage its modules." />
      ) : (
        <div className="space-y-2">
          {modules.map((mod, i) => (
            <Row key={mod.id}>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 px-2 py-1 rounded bg-white/5">#{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-white">{mod.title}</p>
                  <p className="text-xs text-white/40">{mod.duration_text} • ID: {mod.youtube_video_id}</p>
                </div>
              </div>
              <RowActions onEdit={() => { setEditing(mod); setShowForm(true); }} onDelete={() => handleDelete(mod.id)} />
            </Row>
          ))}
          {modules.length === 0 && <Empty text="No modules for this course yet." />}
        </div>
      )}

      {showForm && (
        <ModuleForm
          existing={editing}
          courseId={selectedCourse}
          onClose={() => { setShowForm(false); fetchModules(); }}
        />
      )}
    </div>
  );
}

function ModuleForm({ existing, courseId, onClose }: { existing: Module | null; courseId: string; onClose: () => void }) {
  const [form, setForm] = useState({
    title: existing?.title || '',
    youtube_video_id: existing?.youtube_video_id || '',
    duration_text: existing?.duration_text || '',
    sort_order: existing?.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (existing) {
      await supabase.from('modules').update({ ...form, course_id: courseId }).eq('id', existing.id);
    } else {
      await supabase.from('modules').insert({ ...form, course_id: courseId });
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={existing ? 'Edit Module' : 'New Module'}>
      <FormGrid onSubmit={handleSave} saving={saving}>
        <FormField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <FormField label="YouTube Video ID" value={form.youtube_video_id} onChange={(v) => setForm({ ...form, youtube_video_id: v })} />
        <FormField label="Duration" value={form.duration_text} onChange={(v) => setForm({ ...form, duration_text: v })} placeholder="45 min" />
        <FormField label="Sort Order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: parseInt(v) || 0 })} type="number" />
      </FormGrid>
    </Modal>
  );
}

// ============================================================
// REVIEWS APPROVAL
// ============================================================
function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const fetch = useCallback(async () => {
    let query = supabase
      .from('reviews')
      .select('*, profile:profiles(id, full_name, avatar_url, company_headline), course:courses(id, title, slug)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('approval_status', filter);
    const { data } = await query;
    setReviews((data || []) as unknown as Review[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected', isTop: boolean) => {
    await supabase.from('reviews').update({ approval_status: status, is_top_review: isTop }).eq('id', id);
    fetch();
  };

  const filters: { id: typeof filter; label: string }[] = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Review Moderation</h2>
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setLoading(true); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : reviews.length === 0 ? (
        <Empty text={`No ${filter} reviews.`} />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  {review.profile?.avatar_url ? (
                    <img src={review.profile.avatar_url} alt="" className="h-10 w-10 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-indigo to-neon-violet flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {(review.profile?.full_name || 'A')[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{review.profile?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-white/40">{review.profile?.company_headline}</p>
                    {review.course && (
                      <p className="text-xs text-neon-indigo mt-1">on "{review.course.title}"</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/15'}`} />
                  ))}
                </div>
              </div>
              {review.headline && <p className="text-sm font-semibold text-white mt-3">{review.headline}</p>}
              {review.body && <p className="text-sm text-white/60 mt-1">{review.body}</p>}
              <div className="flex items-center gap-2 mt-4">
                {review.approval_status !== 'approved' && (
                  <Button size="sm" variant="secondary" onClick={() => updateStatus(review.id, 'approved', false)}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                )}
                {review.approval_status !== 'approved' && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(review.id, 'approved', true)}>
                    <Star className="h-3.5 w-3.5" /> Approve as Top
                  </Button>
                )}
                {review.approval_status !== 'rejected' && (
                  <Button size="sm" variant="danger" onClick={() => updateStatus(review.id, 'rejected', false)}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                )}
                <span className={`ml-auto text-xs px-2 py-1 rounded ${review.approval_status === 'approved' ? 'bg-neon-emerald/15 text-neon-emerald' : review.approval_status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-amber-400/15 text-amber-400'}`}>
                  {review.approval_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROMOTIONS
// ============================================================
function PromotionsTab() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, status: Promotion['status']) => {
    await supabase.from('promotions').update({ status }).eq('id', id);
    fetch();
  };

  const statusColors: Record<string, string> = {
    new: 'bg-neon-cyan/15 text-neon-cyan',
    contacted: 'bg-amber-400/15 text-amber-400',
    approved: 'bg-neon-emerald/15 text-neon-emerald',
    rejected: 'bg-red-500/15 text-red-400',
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Promotion Requests</h2>
      {loading ? <Spinner /> : items.length === 0 ? (
        <Empty text="No promotion requests yet." />
      ) : (
        <div className="space-y-3">
          {items.map((promo) => (
            <div key={promo.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{promo.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[promo.status]}`}>{promo.status}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">{promo.channel}</p>
                </div>
                <span className="text-xs text-white/30 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(promo.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm">
                {promo.course_link && (
                  <a href={promo.course_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-neon-indigo hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> Course Link
                  </a>
                )}
                {promo.budget && <p className="text-white/50">Budget: {promo.budget}</p>}
              </div>
              {promo.message && <p className="text-sm text-white/60 mt-3">{promo.message}</p>}
              <div className="flex items-center gap-2 mt-4">
                <select
                  value={promo.status}
                  onChange={(e) => updateStatus(promo.id, e.target.value as Promotion['status'])}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-indigo/50"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHARED UI
// ============================================================
function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <Button size="sm" onClick={onAdd}><Plus className="h-4 w-4" /> Add New</Button>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="glass-card p-4 flex items-center justify-between gap-4 hover:border-white/15 transition-all">{children}</div>;
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button onClick={onEdit} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"><Edit2 className="h-4 w-4" /></button>
      <button onClick={onDelete} className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 text-neon-indigo animate-spin" /></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="glass-card p-12 text-center text-sm text-white/40">{text}</div>;
}

function FormGrid({ children, onSubmit, saving }: { children: React.ReactNode; onSubmit: () => void; saving: boolean }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
      <div className="sm:col-span-2 mt-2">
        <Button type="submit" disabled={saving} className="w-full" size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label, value, onChange, placeholder, type = 'text', full, textarea,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; full?: boolean; textarea?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-indigo/50 resize-none" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-indigo/50" />
      )}
    </div>
  );
}
