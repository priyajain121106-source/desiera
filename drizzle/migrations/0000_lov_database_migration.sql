-- Admin roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users can view their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated, service_role;

-- Per-page SEO settings (read is public: this data is what search engines render)
create table public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_path text not null unique,
  page_type text not null default 'other',
  meta_title text,
  meta_description text,
  og_title text,
  og_description text,
  og_image_url text,
  canonical_url text,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  focus_keyword text,
  json_ld jsonb,
  slug_override text,
  sitemap_include boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
grant select on public.seo_settings to anon, authenticated;
grant insert, update, delete on public.seo_settings to authenticated;
grant all on public.seo_settings to service_role;
alter table public.seo_settings enable row level security;
create policy "Anyone can read SEO settings"
  on public.seo_settings for select to anon, authenticated using (true);
create policy "Admins can insert SEO settings"
  on public.seo_settings for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update SEO settings"
  on public.seo_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete SEO settings"
  on public.seo_settings for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Sitewide defaults (single row)
create table public.seo_site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Desi Era',
  title_suffix text not null default ' — Desi Era',
  default_description text not null default 'Desi Era — kurtis, kurtas, kurta sets and co-ord sets designed for everyday wear.',
  default_og_image_url text not null default 'https://desiera.shop/og-desi-era.jpg',
  site_url text not null default 'https://desiera.shop',
  robots_preset text not null default 'normal' check (robots_preset in ('normal','maintenance')),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
insert into public.seo_site_settings (id) values (1) on conflict (id) do nothing;
grant select on public.seo_site_settings to anon, authenticated;
grant update on public.seo_site_settings to authenticated;
grant all on public.seo_site_settings to service_role;
alter table public.seo_site_settings enable row level security;
create policy "Anyone can read site SEO settings"
  on public.seo_site_settings for select to anon, authenticated using (true);
create policy "Admins can update site SEO settings"
  on public.seo_site_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Slug redirects (public read: the static-site fallback resolves them in the browser)
create table public.seo_redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  created_at timestamptz not null default now(),
  created_by uuid
);
grant select on public.seo_redirects to anon, authenticated;
grant insert, update, delete on public.seo_redirects to authenticated;
grant all on public.seo_redirects to service_role;
alter table public.seo_redirects enable row level security;
create policy "Anyone can read redirects"
  on public.seo_redirects for select to anon, authenticated using (true);
create policy "Admins can insert redirects"
  on public.seo_redirects for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update redirects"
  on public.seo_redirects for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete redirects"
  on public.seo_redirects for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Touch timestamps / updated_by
create or replace function public.seo_touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  if (auth.uid() is not null) then
    new.updated_by = auth.uid();
  end if;
  return new;
end $$;

create trigger seo_settings_touch before update on public.seo_settings
  for each row execute function public.seo_touch_updated_at();
create trigger seo_site_settings_touch before update on public.seo_site_settings
  for each row execute function public.seo_touch_updated_at();