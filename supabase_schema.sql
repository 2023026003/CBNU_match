-- ============================================================
-- CBNUMatch Database Schema
-- Supabase SQL Editor에 붙여넣어 실행하세요
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM 타입 ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE post_category AS ENUM ('SPORTS', 'STUDY', 'CONTEST');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('OPEN', 'CLOSED', 'FULL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── updated_at 자동 갱신 함수 ───────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

-- ─── profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name_enc        TEXT        NOT NULL,
  student_id_enc  TEXT        NOT NULL,
  student_id_hash TEXT        NOT NULL,
  phone_enc       TEXT        NOT NULL,
  department      TEXT        NOT NULL,
  grade           SMALLINT    NOT NULL CHECK (grade BETWEEN 1 AND 6),
  email           TEXT        NOT NULL UNIQUE,
  is_deleted      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_student_id_hash
  ON public.profiles (student_id_hash) WHERE is_deleted = FALSE;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── posts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID          NOT NULL REFERENCES public.profiles(id),
  title           TEXT          NOT NULL CHECK (char_length(title) BETWEEN 2 AND 100),
  content         TEXT          NOT NULL CHECK (char_length(content) BETWEEN 10 AND 3000),
  category        post_category NOT NULL,
  status          post_status   NOT NULL DEFAULT 'OPEN',
  max_members     SMALLINT      NOT NULL CHECK (max_members BETWEEN 1 AND 20),
  current_members SMALLINT      NOT NULL DEFAULT 0 CHECK (current_members >= 0),
  contact_enc     TEXT          NOT NULL,
  deadline        DATE,
  is_deleted      BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_category_status ON public.posts (category, status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts (author_id) WHERE is_deleted = FALSE;

DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── match_applications ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.match_applications (
  id              UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID               NOT NULL REFERENCES public.posts(id),
  applicant_id    UUID               NOT NULL REFERENCES public.profiles(id),
  status          application_status NOT NULL DEFAULT 'PENDING',
  message         TEXT               CHECK (char_length(message) <= 500),
  is_deleted      BOOLEAN            NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_application UNIQUE (post_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_post_id ON public.match_applications (post_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.match_applications (applicant_id) WHERE is_deleted = FALSE;

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.match_applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.match_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS 활성화 ──────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_applications ENABLE ROW LEVEL SECURITY;

-- ─── profiles RLS ────────────────────────────────────────────
DROP POLICY IF EXISTS "본인 프로필 조회" ON public.profiles;
CREATE POLICY "본인 프로필 조회" ON public.profiles
  FOR SELECT USING (auth.uid() = id AND is_deleted = FALSE);

DROP POLICY IF EXISTS "본인 프로필 등록" ON public.profiles;
CREATE POLICY "본인 프로필 등록" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "본인 프로필 수정" ON public.profiles;
CREATE POLICY "본인 프로필 수정" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─── posts RLS ───────────────────────────────────────────────
DROP POLICY IF EXISTS "전체 게시글 조회" ON public.posts;
CREATE POLICY "전체 게시글 조회" ON public.posts
  FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "본인 게시글 작성" ON public.posts;
CREATE POLICY "본인 게시글 작성" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "본인 게시글 수정" ON public.posts;
CREATE POLICY "본인 게시글 수정" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- ─── match_applications RLS ──────────────────────────────────
DROP POLICY IF EXISTS "신청 조회" ON public.match_applications;
CREATE POLICY "신청 조회" ON public.match_applications
  FOR SELECT USING (
    auth.uid() = applicant_id
    OR auth.uid() = (SELECT author_id FROM public.posts WHERE id = post_id)
  );

DROP POLICY IF EXISTS "본인 신청" ON public.match_applications;
CREATE POLICY "본인 신청" ON public.match_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "신청 수정" ON public.match_applications;
CREATE POLICY "신청 수정" ON public.match_applications
  FOR UPDATE USING (
    auth.uid() = applicant_id
    OR auth.uid() = (SELECT author_id FROM public.posts WHERE id = post_id)
  );
