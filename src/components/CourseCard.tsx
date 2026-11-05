import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, BarChart3, Tag } from 'lucide-react';
import type { Course } from '@/lib/supabase';

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const thumbnail =
    course.thumbnail_url ||
    `https://img.youtube.com/vi/${course.youtube_video_id}/maxresdefault.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/course/${course.slug}`}
        className="group block glass-card overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-ink-700">
          <img
            src={thumbnail}
            alt={course.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${course.youtube_video_id}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-4 rounded-full bg-neon-indigo/90 backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
          {course.is_featured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neon-emerald/90 text-white text-xs font-semibold">
              Featured
            </div>
          )}
          {course.duration_text && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white/90 text-xs">
              <Clock className="h-3 w-3" />
              {course.duration_text}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2 text-xs text-white/40">
            {course.category && (
              <span className="text-neon-indigo font-medium">{course.category.name}</span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {course.difficulty}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-neon-indigo transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-white/50 line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">by {course.instructor}</span>
            {course.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-white/30" />
                <span className="text-xs text-white/40">{course.tags.slice(0, 2).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
