-- Run once in the Supabase SQL editor. Images are stored in the existing "notes" bucket under <user id>/doubts/.
alter table public.questions add column if not exists attachments text[] not null default '{}';
