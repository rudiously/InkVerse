-- ============================================================================
-- InkVerse Database Schema — Supabase (PostgreSQL)
-- Run this in the Supabase SQL Editor (or `psql` against your project).
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ============================================================================
-- USERS & PROFILES
-- ============================================================================

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  username text unique not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_verified boolean not null default false,
  is_suspended boolean not null default false,
  verification_token text,
  verification_token_expires timestamptz,
  reset_password_token text,
  reset_password_token_expires timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade unique,
  display_name text not null,
  bio text default '',
  avatar_url text,
  cover_url text,
  location text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_user_id on profiles(user_id);

-- ============================================================================
-- CATEGORIES & TAGS
-- ============================================================================

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  slug text unique not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- CHAPTERS (published works) & DRAFTS
-- ============================================================================

create table if not exists chapters (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  content text not null,          -- rich text / markdown HTML
  excerpt text,
  cover_image_url text,
  category_id uuid references categories(id),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  reading_time_minutes integer default 1,
  views_count integer not null default 0,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chapters_author on chapters(author_id);
create index if not exists idx_chapters_category on chapters(category_id);
create index if not exists idx_chapters_status on chapters(status);
create index if not exists idx_chapters_published_at on chapters(published_at desc);

create table if not exists chapter_tags (
  chapter_id uuid not null references chapters(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (chapter_id, tag_id)
);

-- ============================================================================
-- COMMENTS & REPLIES
-- ============================================================================

create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  parent_comment_id uuid references comments(id) on delete cascade, -- null = top level, set = reply
  content text not null,
  likes_count integer not null default 0,
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_comments_chapter on comments(chapter_id);
create index if not exists idx_comments_parent on comments(parent_comment_id);

create table if not exists comment_likes (
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

-- ============================================================================
-- LIKES, BOOKMARKS, FOLLOWERS
-- ============================================================================

create table if not exists likes (
  chapter_id uuid not null references chapters(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (chapter_id, user_id)
);

create table if not exists bookmarks (
  chapter_id uuid not null references chapters(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (chapter_id, user_id)
);

create table if not exists followers (
  follower_id uuid not null references users(id) on delete cascade,   -- the one who follows
  following_id uuid not null references users(id) on delete cascade,  -- the one being followed
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references users(id) on delete cascade,
  actor_id uuid references users(id) on delete set null,
  type text not null check (type in (
    'like', 'comment', 'reply', 'follow', 'milestone', 'challenge', 'system'
  )),
  chapter_id uuid references chapters(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_recipient on notifications(recipient_id, is_read);

-- ============================================================================
-- REPORTS (content moderation)
-- ============================================================================

create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references users(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- READING HISTORY & VIEWS
-- ============================================================================

create table if not exists reading_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  chapter_id uuid not null references chapters(id) on delete cascade,
  progress_percent integer not null default 0,
  last_read_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create table if not exists chapter_views (
  id uuid primary key default uuid_generate_v4(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  user_id uuid references users(id) on delete set null, -- null for anonymous
  viewed_at timestamptz not null default now()
);

create index if not exists idx_chapter_views_chapter on chapter_views(chapter_id);

-- ============================================================================
-- ACHIEVEMENTS
-- ============================================================================

create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,          -- e.g. 'first_chapter', '100_likes'
  title text not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists user_achievements (
  user_id uuid not null references users(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ============================================================================
-- WRITING CHALLENGES
-- ============================================================================

create table if not exists writing_challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  prompt text,
  category_id uuid references categories(id),
  cover_image_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists challenge_entries (
  challenge_id uuid not null references writing_challenges(id) on delete cascade,
  chapter_id uuid not null references chapters(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  primary key (challenge_id, chapter_id)
);

-- ============================================================================
-- TRIGGERS: keep updated_at fresh
-- ============================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at before update on users
  for each row execute function set_updated_at();

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_chapters_updated_at on chapters;
create trigger trg_chapters_updated_at before update on chapters
  for each row execute function set_updated_at();

drop trigger if exists trg_comments_updated_at on comments;
create trigger trg_comments_updated_at before update on comments
  for each row execute function set_updated_at();

-- ============================================================================
-- TRIGGERS: keep denormalized counters in sync
-- ============================================================================

create or replace function increment_likes_count()
returns trigger as $$
begin
  update chapters set likes_count = likes_count + 1 where id = new.chapter_id;
  return new;
end;
$$ language plpgsql;

create or replace function decrement_likes_count()
returns trigger as $$
begin
  update chapters set likes_count = greatest(likes_count - 1, 0) where id = old.chapter_id;
  return old;
end;
$$ language plpgsql;

drop trigger if exists trg_likes_insert on likes;
create trigger trg_likes_insert after insert on likes
  for each row execute function increment_likes_count();

drop trigger if exists trg_likes_delete on likes;
create trigger trg_likes_delete after delete on likes
  for each row execute function decrement_likes_count();

create or replace function increment_comments_count()
returns trigger as $$
begin
  update chapters set comments_count = comments_count + 1 where id = new.chapter_id;
  return new;
end;
$$ language plpgsql;

create or replace function decrement_comments_count()
returns trigger as $$
begin
  update chapters set comments_count = greatest(comments_count - 1, 0) where id = old.chapter_id;
  return old;
end;
$$ language plpgsql;

drop trigger if exists trg_comments_insert on comments;
create trigger trg_comments_insert after insert on comments
  for each row execute function increment_comments_count();

drop trigger if exists trg_comments_delete on comments;
create trigger trg_comments_delete after delete on comments
  for each row execute function decrement_comments_count();

-- ============================================================================
-- SEED: default categories
-- ============================================================================

insert into categories (name, slug, description) values
  ('Poetry', 'poetry', 'Verses, free form, and structured poems'),
  ('Stories', 'stories', 'Short fiction and standalone stories'),
  ('Novels', 'novels', 'Long-form serialized fiction'),
  ('Romance', 'romance', 'Love stories of every kind'),
  ('Mystery', 'mystery', 'Whodunits and puzzles'),
  ('Thriller', 'thriller', 'Edge-of-your-seat suspense'),
  ('Fantasy', 'fantasy', 'Magic, myth, and other worlds'),
  ('Science Fiction', 'science-fiction', 'Futures, tech, and speculation'),
  ('Horror', 'horror', 'Fear, dread, and the unknown'),
  ('Journal', 'journal', 'Personal daily writing'),
  ('Personal Experience', 'personal-experience', 'True stories from real life'),
  ('Letters', 'letters', 'Letters written and unsent'),
  ('Motivation', 'motivation', 'Encouragement and inspiration'),
  ('Travel', 'travel', 'Journeys and places'),
  ('Nature', 'nature', 'The outdoors and the natural world'),
  ('Friendship', 'friendship', 'Bonds and connection'),
  ('Family', 'family', 'Home and kin'),
  ('Philosophy', 'philosophy', 'Ideas and inquiry'),
  ('Self Growth', 'self-growth', 'Becoming who you want to be'),
  ('Comedy', 'comedy', 'Humor and light writing'),
  ('Opinion', 'opinion', 'Takes and arguments'),
  ('College Life', 'college-life', 'Campus and student life'),
  ('Technology', 'technology', 'Tools, code, and the digital world'),
  ('History', 'history', 'The past, examined'),
  ('Politics', 'politics', 'Civic life and power'),
  ('Business', 'business', 'Work, money, and enterprise'),
  ('Others', 'others', 'Everything else')
on conflict (slug) do nothing;

-- ============================================================================
-- SEED: starter achievements
-- ============================================================================

insert into achievements (code, title, description, icon) values
  ('first_chapter', 'First Words', 'Published your first chapter', 'feather'),
  ('ten_chapters', 'Prolific Writer', 'Published 10 chapters', 'book-open'),
  ('hundred_likes', 'Beloved', 'Reached 100 total likes', 'heart'),
  ('thousand_views', 'Widely Read', 'Reached 1,000 total views', 'eye'),
  ('hundred_followers', 'Community Favorite', 'Reached 100 followers', 'users')
on conflict (code) do nothing;
