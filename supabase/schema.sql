-- Book Club schema. Run once in the Supabase SQL editor on a fresh project.
-- Admin access is profiles.role = 'admin'. Promote a user after they sign up:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');

create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  email text,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.books (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author text not null,
  publication_year integer,
  genre text,
  description text,
  cover_url text,
  content text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_books (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'reading', 'completed')),
  last_page integer default 0,
  current_page integer default 1,
  total_pages integer default 0,
  is_favorite boolean default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, book_id)
);

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, book_id)
);

create index idx_books_title on public.books (title);
create index idx_books_author on public.books (author);
create index idx_books_genre on public.books (genre);
create index idx_user_books_user_id on public.user_books (user_id);
create index idx_reviews_book_id on public.reviews (book_id);

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.user_books enable row level security;
alter table public.reviews enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger update_books_updated_at
  before update on public.books
  for each row execute procedure public.handle_updated_at();

create trigger update_user_books_updated_at
  before update on public.user_books
  for each row execute procedure public.handle_updated_at();

create trigger update_reviews_updated_at
  before update on public.reviews
  for each row execute procedure public.handle_updated_at();

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());
create policy "Admins can update all profiles" on public.profiles
  for update using (public.is_admin());

create policy "Everyone can view books" on public.books
  for select using (true);
create policy "Admins can insert books" on public.books
  for insert with check (public.is_admin());
create policy "Admins can update books" on public.books
  for update using (public.is_admin());
create policy "Admins can delete books" on public.books
  for delete using (public.is_admin());

create policy "Users can view own user_books" on public.user_books
  for select using (auth.uid() = user_id);
create policy "Users can insert own user_books" on public.user_books
  for insert with check (auth.uid() = user_id);
create policy "Users can update own user_books" on public.user_books
  for update using (auth.uid() = user_id);
create policy "Users can delete own user_books" on public.user_books
  for delete using (auth.uid() = user_id);
create policy "Admins can view all user_books" on public.user_books
  for select using (public.is_admin());

create policy "Everyone can view reviews" on public.reviews
  for select using (true);
create policy "Users can insert reviews" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews
  for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews
  for delete using (auth.uid() = user_id);
create policy "Admins can delete reviews" on public.reviews
  for delete using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.books, public.reviews to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.user_books, public.reviews to authenticated;
grant select, insert, update, delete on public.books to authenticated;
grant execute on function public.is_admin() to authenticated;

insert into public.books (title, author, publication_year, genre, description, content) values
('Pride and Prejudice', 'Jane Austen', 1813, 'Classic',
 'A story about first impressions, family, and two people who change their minds.',
 'Elizabeth Bennet meets Mr Darcy at a country dance and decides she already understands him. The rest of the book is the slow work of being wrong, and of noticing what a person does when nobody is applauding.'),
('Frankenstein', 'Mary Shelley', 1818, 'Gothic',
 'A student builds a life and then refuses to take responsibility for it.',
 'Victor Frankenstein wants knowledge without a witness. When the being he made asks for a place in the world, Victor looks away. The tragedy is not the experiment. It is the abandonment.'),
('The Odyssey', 'Homer', -700, 'Epic',
 'A long journey home, told as a series of choices about who you remain.',
 'Odysseus spends years trying to return to Ithaca. Every stop offers him another life. The poem keeps asking whether getting home is a place, or the decision to stay the same person when the easier story is available.');
