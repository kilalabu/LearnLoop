-- 1. Profiles Table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  created_at timestamptz default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- 2. Quizzes Table
create table public.quizzes (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  options jsonb not null, -- Array of {id, text, isCorrect}
  explanation text not null,
  source_url text, -- Optional
  source_type text not null default 'manual', -- 'manual', 'notion', 'url'
  category text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

alter table public.quizzes enable row level security;

create policy "Users can manage their own quizzes"
  on public.quizzes for all
  using ( auth.uid() = user_id );

-- 3. Quiz Generation Batches Table
create table public.quiz_generation_batches (
  id text not null, -- Batch ID from provider
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null, -- 'openai', 'anthropic'
  status text not null, -- 'pending', 'completed', 'failed'
  notion_page_id text, -- Optional
  created_at timestamptz default now(),
  primary key (id)
);

alter table public.quiz_generation_batches enable row level security;

create policy "Users can manage their own quiz generation batches"
  on public.quiz_generation_batches for all
  using ( auth.uid() = user_id );

-- 4. User Progress Table
create table public.user_progress (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  is_correct boolean not null default false,
  attempt_count int not null default 0,
  forgetting_step int not null default 0,
  last_answered_at timestamptz,
  next_review_at timestamptz,
  is_hidden boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id),
  unique(user_id, quiz_id)
);

alter table public.user_progress enable row level security;

create policy "Users can manage their own progress"
  on public.user_progress for all
  using ( auth.uid() = user_id );

-- 5. Triggers (Updated At & Auto Profile)

-- Function to handle updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at_quizzes
  before update on public.quizzes
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at_user_progress
  before update on public.user_progress
  for each row execute procedure moddatetime (updated_at);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Indexes (Performance Optimization)
create index if not exists idx_user_progress_user_next_review on public.user_progress(user_id, next_review_at);
create index if not exists idx_quizzes_user_category on public.quizzes(user_id, category);

-- FK Indexes for Joins
create index if not exists idx_quizzes_user_id on public.quizzes(user_id);
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_quiz_id on public.user_progress(quiz_id);
