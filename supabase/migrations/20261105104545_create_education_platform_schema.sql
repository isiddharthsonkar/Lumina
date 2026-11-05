/*
# Create Education Platform Schema

## Overview
Builds the complete database for a curated YouTube courses education platform.
Courses are manually entered (no YouTube API) with iframe embeds stored as metadata.

## New Tables
1. `profiles` — Extended user data linked to auth.users (LinkedIn login).
   - `id` (uuid, PK, FK to auth.users), `full_name`, `avatar_url`, `company_headline`, `is_admin`
2. `categories` — Course categories (e.g. Web Dev, AI, Design).
   - `id`, `name`, `slug` (unique), `description`, `icon_name`, `color`, `sort_order`, `created_at`
3. `courses` — Curated YouTube courses.
   - `id`, `title`, `slug` (unique), `description`, `youtube_video_id`, `category_id` (FK), `thumbnail_url`, `instructor`, `difficulty`, `duration_text`, `tags` (text[]), `is_featured`, `sort_order`, `created_at`
4. `modules` — Modules/chapters within a course (sidebar checklist items).
   - `id`, `course_id` (FK, cascade), `title`, `youtube_video_id`, `duration_text`, `sort_order`, `created_at`
5. `course_interactions` — Per-user like/dislike/bookmark on courses.
   - `id`, `user_id` (FK auth.users cascade), `course_id` (FK cascade), `interaction_type` (enum: like/dislike/bookmark), `created_at`
   - Unique constraint on (user_id, course_id, interaction_type)
6. `reviews` — LinkedIn-authenticated course reviews.
   - `id`, `user_id` (FK cascade), `course_id` (FK cascade), `rating` (1-5), `headline`, `body`, `is_top_review`, `approval_status` (enum: pending/approved/rejected), `created_at`
7. `promotions` — Creator collaboration / advertising requests.
   - `id`, `name`, `channel`, `course_link`, `budget`, `message`, `status` (enum: new/contacted/approved/rejected), `created_at`

## Enums
- `interaction_type_enum`: like, dislike, bookmark
- `review_status_enum`: pending, approved, rejected
- `promotion_status_enum`: new, contacted, approved, rejected

## Security (RLS)
- `profiles`: users read their own + admin reads all; users update own non-admin fields. `is_admin` column is NOT user-writable.
- `categories`, `courses`, `modules`: public read (anon + authenticated); admin-only write.
- `course_interactions`: authenticated users CRUD only their own rows.
- `reviews`: public read approved reviews; authenticated insert own; admin update approval status.
- `promotions`: authenticated insert (anon also can insert so anyone can submit); admin-only read/update. Non-admins cannot see other people's submissions.
*/

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE interaction_type_enum AS ENUM ('like', 'dislike', 'bookmark');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE review_status_enum AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE promotion_status_enum AS ENUM ('new', 'contacted', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  company_headline text DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Users can read their own profile; admins can read all
DROP POLICY IF EXISTS "select_own_or_admin_profiles" ON profiles;
CREATE POLICY "select_own_or_admin_profiles"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Users can update their own profile (but not is_admin — enforced via column grant)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Column-restricted: users can only update display fields, NOT is_admin
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, company_headline) ON profiles TO authenticated;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon_name text DEFAULT 'BookOpen',
  color text DEFAULT 'indigo',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON categories TO authenticated;

-- Public read
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories"
ON categories FOR SELECT
TO anon, authenticated
USING (true);

-- Admin-only write
DROP POLICY IF EXISTS "admin_write_categories" ON categories;
CREATE POLICY "admin_write_categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories"
ON categories FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories"
ON categories FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  youtube_video_id text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  thumbnail_url text DEFAULT '',
  instructor text DEFAULT '',
  difficulty text DEFAULT 'Beginner',
  duration_text text DEFAULT '',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON courses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON courses TO authenticated;

DROP POLICY IF EXISTS "public_read_courses" ON courses;
CREATE POLICY "public_read_courses"
ON courses FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_write_courses" ON courses;
CREATE POLICY "admin_write_courses"
ON courses FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "admin_update_courses" ON courses;
CREATE POLICY "admin_update_courses"
ON courses FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "admin_delete_courses" ON courses;
CREATE POLICY "admin_delete_courses"
ON courses FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ============================================================
-- MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  youtube_video_id text NOT NULL DEFAULT '',
  duration_text text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON modules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON modules TO authenticated;

DROP POLICY IF EXISTS "public_read_modules" ON modules;
CREATE POLICY "public_read_modules"
ON modules FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_write_modules" ON modules;
CREATE POLICY "admin_write_modules"
ON modules FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "admin_update_modules" ON modules;
CREATE POLICY "admin_update_modules"
ON modules FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "admin_delete_modules" ON modules;
CREATE POLICY "admin_delete_modules"
ON modules FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ============================================================
-- COURSE_INTERACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS course_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  interaction_type interaction_type_enum NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, course_id, interaction_type)
);

ALTER TABLE course_interactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON course_interactions TO authenticated;

DROP POLICY IF EXISTS "select_own_interactions" ON course_interactions;
CREATE POLICY "select_own_interactions"
ON course_interactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_interactions" ON course_interactions;
CREATE POLICY "insert_own_interactions"
ON course_interactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_interactions" ON course_interactions;
CREATE POLICY "update_own_interactions"
ON course_interactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_interactions" ON course_interactions;
CREATE POLICY "delete_own_interactions"
ON course_interactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  headline text DEFAULT '',
  body text DEFAULT '',
  is_top_review boolean DEFAULT false,
  approval_status review_status_enum NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON reviews TO authenticated;
GRANT UPDATE, DELETE ON reviews TO authenticated;

-- Public can read approved reviews
DROP POLICY IF EXISTS "read_approved_reviews" ON reviews;
CREATE POLICY "read_approved_reviews"
ON reviews FOR SELECT
TO anon, authenticated
USING (approval_status = 'approved' OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Authenticated users can insert their own reviews
DROP POLICY IF EXISTS "insert_own_review" ON reviews;
CREATE POLICY "insert_own_review"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own reviews; admins can update approval status
DROP POLICY IF EXISTS "update_own_or_admin_review" ON reviews;
CREATE POLICY "update_own_or_admin_review"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "delete_own_review" ON reviews;
CREATE POLICY "delete_own_review"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- PROMOTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  channel text NOT NULL DEFAULT '',
  course_link text DEFAULT '',
  budget text DEFAULT '',
  message text DEFAULT '',
  status promotion_status_enum NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can insert a promotion request
-- Only admins can read/update them
GRANT INSERT ON promotions TO anon, authenticated;
GRANT SELECT, UPDATE ON promotions TO authenticated;

DROP POLICY IF EXISTS "insert_promotions" ON promotions;
CREATE POLICY "insert_promotions"
ON promotions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_promotions" ON promotions;
CREATE POLICY "admin_read_promotions"
ON promotions FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "admin_update_promotions" ON promotions;
CREATE POLICY "admin_update_promotions"
ON promotions FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ============================================================
-- TRIGGER: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, company_headline)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_headline', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO categories (name, slug, description, icon_name, color, sort_order)
SELECT 'Web Development', 'web-development', 'Frontend, backend, and full-stack web development courses.', 'Code', 'indigo', 0
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'web-development');

INSERT INTO categories (name, slug, description, icon_name, color, sort_order)
SELECT 'AI & Machine Learning', 'ai-machine-learning', 'Artificial intelligence, ML, deep learning, and data science.', 'Brain', 'emerald', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ai-machine-learning');

INSERT INTO categories (name, slug, description, icon_name, color, sort_order)
SELECT 'Design & UX', 'design-ux', 'UI/UX design, graphic design, and creative workflows.', 'Palette', 'violet', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'design-ux');

INSERT INTO categories (name, slug, description, icon_name, color, sort_order)
SELECT 'DevOps & Cloud', 'devops-cloud', 'Cloud infrastructure, CI/CD, containers, and deployment.', 'Cloud', 'cyan', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'devops-cloud');

INSERT INTO categories (name, slug, description, icon_name, color, sort_order)
SELECT 'Data Structures & Algorithms', 'dsa', 'Problem solving, algorithms, and data structures.', 'Binary', 'amber', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'dsa');

-- Seed courses
INSERT INTO courses (title, slug, description, youtube_video_id, category_id, thumbnail_url, instructor, difficulty, duration_text, tags, is_featured, sort_order)
SELECT
  'React - The Complete Guide (2026 Edition)',
  'react-complete-guide-2026',
  'Master React from fundamentals to advanced patterns. Build real-world projects with hooks, context, routing, and state management.',
  'SqcYwc3Y7w4',
  (SELECT id FROM categories WHERE slug = 'web-development'),
  '',
  'Academind',
  'All Levels',
  '12 hours',
  ARRAY['React', 'JavaScript', 'Frontend', 'Hooks'],
  true,
  0
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'react-complete-guide-2026');

INSERT INTO courses (title, slug, description, youtube_video_id, category_id, thumbnail_url, instructor, difficulty, duration_text, tags, is_featured, sort_order)
SELECT
  'Machine Learning for Beginners - Full Course',
  'ml-beginners-full-course',
  'A complete introduction to machine learning covering supervised learning, unsupervised learning, neural networks, and practical projects.',
  'uk9FE7s7QKU',
  (SELECT id FROM categories WHERE slug = 'ai-machine-learning'),
  '',
  'freeCodeCamp',
  'Beginner',
  '8 hours',
  ARRAY['Python', 'ML', 'AI', 'Data Science'],
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'ml-beginners-full-course');

INSERT INTO courses (title, slug, description, youtube_video_id, category_id, thumbnail_url, instructor, difficulty, duration_text, tags, is_featured, sort_order)
SELECT
  'UI/UX Design Fundamentals - Complete Guide',
  'uiux-design-fundamentals',
  'Learn the principles of user interface and user experience design. Cover typography, color theory, layout, and prototyping.',
  'c9Wg6I6g6v8',
  (SELECT id FROM categories WHERE slug = 'design-ux'),
  '',
  'DesignCourse',
  'Beginner',
  '6 hours',
  ARRAY['Design', 'UX', 'UI', 'Figma'],
  false,
  2
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'uiux-design-fundamentals');

INSERT INTO courses (title, slug, description, youtube_video_id, category_id, thumbnail_url, instructor, difficulty, duration_text, tags, is_featured, sort_order)
SELECT
  'Docker & Kubernetes - Full Course for Beginners',
  'docker-kubernetes-course',
  'Learn containerization with Docker and orchestration with Kubernetes. Build, ship, and run distributed applications.',
  'kTp5Z1aGPFs',
  (SELECT id FROM categories WHERE slug = 'devops-cloud'),
  '',
  'TechWorld with Nana',
  'Intermediate',
  '10 hours',
  ARRAY['Docker', 'Kubernetes', 'DevOps', 'Cloud'],
  true,
  3
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'docker-kubernetes-course');

INSERT INTO courses (title, slug, description, youtube_video_id, category_id, thumbnail_url, instructor, difficulty, duration_text, tags, is_featured, sort_order)
SELECT
  'Data Structures and Algorithms - Full Course',
  'dsa-full-course',
  'Comprehensive DSA course covering arrays, linked lists, trees, graphs, sorting, and dynamic programming with interview problems.',
  'tV2zL3v3S5k',
  (SELECT id FROM categories WHERE slug = 'dsa'),
  '',
  'Abdul Bari',
  'All Levels',
  '14 hours',
  ARRAY['Algorithms', 'Data Structures', 'Interview', 'Java'],
  false,
  4
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'dsa-full-course');

INSERT INTO courses (title, slug, description, youtube_video_id, category_id, thumbnail_url, instructor, difficulty, duration_text, tags, is_featured, sort_order)
SELECT
  'TypeScript Tutorial for Beginners - Full Course',
  'typescript-beginners-course',
  'Learn TypeScript from scratch. Understand types, interfaces, generics, and how to build type-safe applications.',
  'd56m8y5t3fQ',
  (SELECT id FROM categories WHERE slug = 'web-development'),
  '',
  'Programming with Mosh',
  'Beginner',
  '4 hours',
  ARRAY['TypeScript', 'JavaScript', 'Types'],
  false,
  5
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'typescript-beginners-course');

-- Seed modules for React course
INSERT INTO modules (course_id, title, youtube_video_id, duration_text, sort_order)
SELECT c.id, 'Introduction & Setup', 'SqcYwc3Y7w4', '15 min', 0
FROM courses c WHERE c.slug = 'react-complete-guide-2026'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.course_id = c.id AND m.title = 'Introduction & Setup');

INSERT INTO modules (course_id, title, youtube_video_id, duration_text, sort_order)
SELECT c.id, 'Components & Props', 'bMknf4f4r2w', '45 min', 1
FROM courses c WHERE c.slug = 'react-complete-guide-2026'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.course_id = c.id AND m.title = 'Components & Props');

INSERT INTO modules (course_id, title, youtube_video_id, duration_text, sort_order)
SELECT c.id, 'State & Hooks', 'O6P07r5qYjg', '60 min', 2
FROM courses c WHERE c.slug = 'react-complete-guide-2026'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.course_id = c.id AND m.title = 'State & Hooks');

INSERT INTO modules (course_id, title, youtube_video_id, duration_text, sort_order)
SELECT c.id, 'Context & Redux', '35lZQ6Pt5XE', '50 min', 3
FROM courses c WHERE c.slug = 'react-complete-guide-2026'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.course_id = c.id AND m.title = 'Context & Redux');

INSERT INTO modules (course_id, title, youtube_video_id, duration_text, sort_order)
SELECT c.id, 'Routing & Deployment', '5nfw2Q7qD0Q', '40 min', 4
FROM courses c WHERE c.slug = 'react-complete-guide-2026'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.course_id = c.id AND m.title = 'Routing & Deployment');

-- Seed modules for ML course
INSERT INTO modules (course_id, title, youtube_video_id, duration_text, sort_order)
SELECT c.id, 'What is Machine Learning?', 'uk9FE7s7QKU', '20 min', 0
FROM courses c WHERE c.slug = 'ml-beginners-full-course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.course_id = c.id AND m.title = 'What is Machine Learning?');

INSERT INTO modules (course_id, title, youtube_video_id, duration_text, sort_order)
SELECT c.id, 'Supervised Learning', '4qVR06g5r5E', '55 min', 1
FROM courses c WHERE c.slug = 'ml-beginners-full-course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.course_id = c.id AND m.title = 'Supervised Learning');

INSERT INTO modules (course_id, title, youtube_video_id, duration_text, sort_order)
SELECT c.id, 'Neural Networks', 'qTU5r5k7q5E', '65 min', 2
FROM courses c WHERE c.slug = 'ml-beginners-full-course'
AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.course_id = c.id AND m.title = 'Neural Networks');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user_course ON course_interactions(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(approval_status);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
