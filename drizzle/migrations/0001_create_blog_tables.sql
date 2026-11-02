create type public.blog_status as enum ('draft', 'published');

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  featured_image_url text,
  featured_image_alt text,
  category_id uuid references public.blog_categories(id) on delete set null,
  tags text[] not null default '{}',
  author_name text not null default 'Desi Era',
  published_at timestamptz,
  reading_time_minutes integer not null default 1,
  status public.blog_status not null default 'draft',
  meta_title text,
  meta_description text,
  focus_keyword text,
  secondary_keywords text[] not null default '{}',
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  robots_index boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_status_idx on public.blog_posts (status, published_at);
create index blog_posts_category_idx on public.blog_posts (category_id);

-- Starter categories
insert into public.blog_categories (name, slug, description, sort_order) values
  ('Styling', 'styling', 'How to style kurtis, kurtas and co-ord sets', 1),
  ('Fabric Guide', 'fabric-guide', 'Fabrics, care and comfort', 2),
  ('Occasions', 'occasions', 'Festive, wedding, office and everyday', 3),
  ('Trends', 'trends', 'What we are loving this season', 4);

-- Data API access
grant select on public.blog_categories to anon, authenticated;
grant insert, update, delete on public.blog_categories to authenticated;
grant all on public.blog_categories to service_role;
grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant all on public.blog_posts to service_role;

alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;

create policy "Anyone can read categories"
  on public.blog_categories for select
  to anon, authenticated
  using (true);

create policy "Admins manage categories"
  on public.blog_categories for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can read published posts"
  on public.blog_posts for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can read drafts"
  on public.blog_posts for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage posts"
  on public.blog_posts for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- keep updated_at fresh
create or replace function public.set_blog_post_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger blog_posts_touch_updated_at
  before update on public.blog_posts
  for each row execute function public.set_blog_post_updated_at();

-- Blog image storage: public read of the bucket, admin-only writes
create policy "Anyone can view blog media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-media');

create policy "Admins can upload blog media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update blog media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete blog media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'));