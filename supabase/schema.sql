-- Eval Co-pilot Supabase schema
-- Run this file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.golden_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  title text not null default 'Untitled case',
  input text not null,
  expected_output text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.rubrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  rubric_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(feature_id)
);

create table if not exists public.eval_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  label text not null default 'Eval run',
  model_provider text not null default 'fallback',
  model_name text not null default 'keyword-overlap',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.case_grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  run_id uuid not null references public.eval_runs(id) on delete cascade,
  golden_case_id uuid not null references public.golden_cases(id) on delete cascade,
  actual_output text not null,
  status text not null check (status in ('pass', 'fail', 'needs_review')),
  score numeric not null check (score >= 0 and score <= 1),
  reason text not null,
  missing_requirements text[] not null default '{}',
  suggested_fix text,
  is_unknown_failure boolean not null default false,
  created_at timestamptz not null default now(),
  unique(run_id, golden_case_id)
);

create table if not exists public.change_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  before_run_id uuid references public.eval_runs(id) on delete set null,
  after_run_id uuid references public.eval_runs(id) on delete set null,
  change_type text not null check (change_type in ('prompt', 'guardrail', 'retrieval', 'schema', 'model', 'other')),
  change_description text not null,
  evidence_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  label text not null,
  model_name text,
  prompt_text text not null,
  retrieval_config text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.assertions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  name text not null,
  assertion_type text not null check (assertion_type in ('contains', 'not_contains', 'max_length', 'valid_json')),
  value text,
  severity text not null default 'critical' check (severity in ('critical', 'warning')),
  created_at timestamptz not null default now()
);

create table if not exists public.production_traces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  title text not null,
  input text not null,
  bad_output text not null,
  why_wrong text not null,
  expected_behavior text,
  converted_to_case_id uuid references public.golden_cases(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.features enable row level security;
alter table public.golden_cases enable row level security;
alter table public.rubrics enable row level security;
alter table public.eval_runs enable row level security;
alter table public.case_grades enable row level security;
alter table public.change_logs enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.assertions enable row level security;
alter table public.production_traces enable row level security;

-- Helper: ownership policies
drop policy if exists features_select_own on public.features;
create policy features_select_own on public.features
for select using ((select auth.uid()) = user_id);

drop policy if exists features_insert_own on public.features;
create policy features_insert_own on public.features
for insert with check ((select auth.uid()) = user_id);

drop policy if exists features_update_own on public.features;
create policy features_update_own on public.features
for update using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists features_delete_own on public.features;
create policy features_delete_own on public.features
for delete using ((select auth.uid()) = user_id);

drop policy if exists golden_cases_select_own on public.golden_cases;
create policy golden_cases_select_own on public.golden_cases
for select using ((select auth.uid()) = user_id);

drop policy if exists golden_cases_insert_own on public.golden_cases;
create policy golden_cases_insert_own on public.golden_cases
for insert with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.features f
    where f.id = feature_id and f.user_id = (select auth.uid())
  )
);

drop policy if exists golden_cases_update_own on public.golden_cases;
create policy golden_cases_update_own on public.golden_cases
for update using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.features f
    where f.id = feature_id and f.user_id = (select auth.uid())
  )
);

drop policy if exists golden_cases_delete_own on public.golden_cases;
create policy golden_cases_delete_own on public.golden_cases
for delete using ((select auth.uid()) = user_id);

drop policy if exists rubrics_select_own on public.rubrics;
create policy rubrics_select_own on public.rubrics
for select using ((select auth.uid()) = user_id);

drop policy if exists rubrics_insert_own on public.rubrics;
create policy rubrics_insert_own on public.rubrics
for insert with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.features f
    where f.id = feature_id and f.user_id = (select auth.uid())
  )
);

drop policy if exists rubrics_update_own on public.rubrics;
create policy rubrics_update_own on public.rubrics
for update using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists rubrics_delete_own on public.rubrics;
create policy rubrics_delete_own on public.rubrics
for delete using ((select auth.uid()) = user_id);

drop policy if exists eval_runs_select_own on public.eval_runs;
create policy eval_runs_select_own on public.eval_runs
for select using ((select auth.uid()) = user_id);

drop policy if exists eval_runs_insert_own on public.eval_runs;
create policy eval_runs_insert_own on public.eval_runs
for insert with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.features f
    where f.id = feature_id and f.user_id = (select auth.uid())
  )
);

drop policy if exists eval_runs_update_own on public.eval_runs;
create policy eval_runs_update_own on public.eval_runs
for update using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists eval_runs_delete_own on public.eval_runs;
create policy eval_runs_delete_own on public.eval_runs
for delete using ((select auth.uid()) = user_id);

drop policy if exists case_grades_select_own on public.case_grades;
create policy case_grades_select_own on public.case_grades
for select using ((select auth.uid()) = user_id);

drop policy if exists case_grades_insert_own on public.case_grades;
create policy case_grades_insert_own on public.case_grades
for insert with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.eval_runs r
    where r.id = run_id and r.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.golden_cases c
    where c.id = golden_case_id and c.user_id = (select auth.uid())
  )
);

drop policy if exists case_grades_update_own on public.case_grades;
create policy case_grades_update_own on public.case_grades
for update using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists case_grades_delete_own on public.case_grades;
create policy case_grades_delete_own on public.case_grades
for delete using ((select auth.uid()) = user_id);

drop policy if exists change_logs_select_own on public.change_logs;
create policy change_logs_select_own on public.change_logs
for select using ((select auth.uid()) = user_id);

drop policy if exists change_logs_insert_own on public.change_logs;
create policy change_logs_insert_own on public.change_logs
for insert with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.features f
    where f.id = feature_id and f.user_id = (select auth.uid())
  )
);

drop policy if exists change_logs_update_own on public.change_logs;
create policy change_logs_update_own on public.change_logs
for update using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists change_logs_delete_own on public.change_logs;
create policy change_logs_delete_own on public.change_logs
for delete using ((select auth.uid()) = user_id);

-- Prompt versions
drop policy if exists prompt_versions_select_own on public.prompt_versions;
create policy prompt_versions_select_own on public.prompt_versions for select using ((select auth.uid()) = user_id);
drop policy if exists prompt_versions_insert_own on public.prompt_versions;
create policy prompt_versions_insert_own on public.prompt_versions for insert with check ((select auth.uid()) = user_id and exists (select 1 from public.features f where f.id = feature_id and f.user_id = (select auth.uid())));
drop policy if exists prompt_versions_delete_own on public.prompt_versions;
create policy prompt_versions_delete_own on public.prompt_versions for delete using ((select auth.uid()) = user_id);

-- Assertions
drop policy if exists assertions_select_own on public.assertions;
create policy assertions_select_own on public.assertions for select using ((select auth.uid()) = user_id);
drop policy if exists assertions_insert_own on public.assertions;
create policy assertions_insert_own on public.assertions for insert with check ((select auth.uid()) = user_id and exists (select 1 from public.features f where f.id = feature_id and f.user_id = (select auth.uid())));
drop policy if exists assertions_delete_own on public.assertions;
create policy assertions_delete_own on public.assertions for delete using ((select auth.uid()) = user_id);

-- Production traces
drop policy if exists production_traces_select_own on public.production_traces;
create policy production_traces_select_own on public.production_traces for select using ((select auth.uid()) = user_id);
drop policy if exists production_traces_insert_own on public.production_traces;
create policy production_traces_insert_own on public.production_traces for insert with check ((select auth.uid()) = user_id and exists (select 1 from public.features f where f.id = feature_id and f.user_id = (select auth.uid())));
drop policy if exists production_traces_update_own on public.production_traces;
create policy production_traces_update_own on public.production_traces for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists production_traces_delete_own on public.production_traces;
create policy production_traces_delete_own on public.production_traces for delete using ((select auth.uid()) = user_id);

create index if not exists idx_features_user_id on public.features(user_id);
create index if not exists idx_golden_cases_user_feature on public.golden_cases(user_id, feature_id);
create index if not exists idx_rubrics_user_feature on public.rubrics(user_id, feature_id);
create index if not exists idx_eval_runs_user_feature on public.eval_runs(user_id, feature_id);
create index if not exists idx_case_grades_user_run on public.case_grades(user_id, run_id);
create index if not exists idx_case_grades_case on public.case_grades(golden_case_id);
create index if not exists idx_change_logs_feature on public.change_logs(feature_id);

create index if not exists idx_prompt_versions_feature on public.prompt_versions(user_id, feature_id);
create index if not exists idx_assertions_feature on public.assertions(user_id, feature_id);
create index if not exists idx_production_traces_feature on public.production_traces(user_id, feature_id);
