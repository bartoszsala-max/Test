-- BookShelf Database Schema
-- Run this in your Supabase SQL Editor

create extension if not exists "uuid-ossp";

create table if not exists books (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users on delete cascade not null,
  title           text not null,
  authors         text[] default '{}',
  cover_url       text,
  isbn            text,
  page_count      int,
  description     text,
  categories      text[] default '{}',
  avg_rating      decimal(3,1),
  published_date  text,
  preview_link    text,
  status          text not null default 'wishlist' check (status in ('wishlist','in_reading','read')),
  wishlist_year   int,
  reading_format  text check (reading_format in ('paper','kindle','audiobook')),
  start_date      date,
  end_date        date,
  personal_rating int check (personal_rating >= 1 and personal_rating <= 5),
  personal_review text,
  sort_order      int default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists excerpts (
  id                uuid primary key default uuid_generate_v4(),
  book_id           uuid references books on delete cascade not null,
  text              text,
  page_ref          text,
  photo_url         text,
  ai_interpretation text,
  ai_summary        text,
  created_at        timestamptz not null default now()
);

create table if not exists thoughts (
  id          uuid primary key default uuid_generate_v4(),
  book_id     uuid references books on delete cascade not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists books_user_id_idx on books(user_id);
create index if not exists books_status_idx on books(status);
create index if not exists books_user_status_idx on books(user_id, status);
create index if not exists excerpts_book_id_idx on excerpts(book_id);
create index if not exists thoughts_book_id_idx on thoughts(book_id);

alter table books enable row level security;
alter table excerpts enable row level security;
alter table thoughts enable row level security;

create policy "Users can view own books" on books for select using (auth.uid() = user_id);
create policy "Users can insert own books" on books for insert with check (auth.uid() = user_id);
create policy "Users can update own books" on books for update using (auth.uid() = user_id);
create policy "Users can delete own books" on books for delete using (auth.uid() = user_id);

create policy "Users can view excerpts of own books" on excerpts for select using (exists (select 1 from books where books.id = excerpts.book_id and books.user_id = auth.uid()));
create policy "Users can insert excerpts for own books" on excerpts for insert with check (exists (select 1 from books where books.id = excerpts.book_id and books.user_id = auth.uid()));
create policy "Users can update excerpts of own books" on excerpts for update using (exists (select 1 from books where books.id = excerpts.book_id and books.user_id = auth.uid()));
create policy "Users can delete excerpts of own books" on excerpts for delete using (exists (select 1 from books where books.id = excerpts.book_id and books.user_id = auth.uid()));

create policy "Users can view thoughts of own books" on thoughts for select using (exists (select 1 from books where books.id = thoughts.book_id and books.user_id = auth.uid()));
create policy "Users can insert thoughts for own books" on thoughts for insert with check (exists (select 1 from books where books.id = thoughts.book_id and books.user_id = auth.uid()));
create policy "Users can update thoughts of own books" on thoughts for update using (exists (select 1 from books where books.id = thoughts.book_id and books.user_id = auth.uid()));
create policy "Users can delete thoughts of own books" on thoughts for delete using (exists (select 1 from books where books.id = thoughts.book_id and books.user_id = auth.uid()));

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_books_updated_at
  before update on books
  for each row execute function update_updated_at_column();
