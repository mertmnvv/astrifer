-- Astrifer core schema: templates, star_maps, orders + two storage buckets.
--
-- Security model for the 300dpi print asset:
--   - it lives in the PRIVATE bucket "starmaps-print"
--   - storage.objects has no SELECT policy for anon/authenticated on that
--     bucket, so no client-side call (getPublicUrl, createSignedUrl) can
--     ever succeed against it
--   - the only way to read it is a server-side Edge Function running with
--     the service role key, which mints a short-lived signed URL on demand
--     (see supabase/functions/get-print-asset). Never persist that URL.

create type order_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded',
  'fulfilled',
  'shipped'
);

create type product_type as enum (
  'digital',
  'poster',
  'framed_poster'
);

create type template_category as enum (
  'dogum',
  'yildonumu',
  'teklif',
  'mezuniyet',
  'anma'
);

create table templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category template_category not null,
  description text,
  default_message text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table star_maps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  template_id uuid references templates (id) on delete set null,
  title text not null,
  message text,
  event_date timestamptz not null,
  timezone text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location_name text not null,
  music_url text,
  screen_res_image_path text,
  print_ready_path text,
  is_public boolean not null default true,
  view_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index star_maps_slug_idx on star_maps (slug);
create index star_maps_user_id_idx on star_maps (user_id);

create table orders (
  id uuid primary key default gen_random_uuid(),
  star_map_id uuid not null references star_maps (id) on delete cascade,
  customer_email text not null,
  customer_name text,
  product_type product_type not null,
  size text,
  frame_option text,
  price_amount numeric(10, 2) not null check (price_amount >= 0),
  currency text not null default 'TRY',
  status order_status not null default 'pending',
  iyzico_payment_id text,
  iyzico_conversation_id text,
  shipping_address jsonb,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_star_map_id_idx on orders (star_map_id);
create index orders_status_idx on orders (status);
create index orders_iyzico_conversation_id_idx on orders (iyzico_conversation_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger star_maps_set_updated_at
  before update on star_maps
  for each row
  execute function set_updated_at();

create trigger orders_set_updated_at
  before update on orders
  for each row
  execute function set_updated_at();

-- Row Level Security ---------------------------------------------------

alter table templates enable row level security;
alter table star_maps enable row level security;
alter table orders enable row level security;

create policy "templates are publicly readable when active"
  on templates for select
  to anon, authenticated
  using (is_active);

create policy "star maps are readable when public"
  on star_maps for select
  to anon, authenticated
  using (is_public or auth.uid() = user_id);

create policy "authenticated users can create their own star maps"
  on star_maps for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "owners can update their own star maps"
  on star_maps for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No client-side insert/select/update policy on `orders` at all: every order
-- is created and read via server-side routes using the service role key
-- (checkout needs to validate price against the template/product server-side
-- before iyzico is ever called), so RLS defaults to deny for anon/authenticated.

-- Storage ---------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('starmaps-public', 'starmaps-public', true),
  ('starmaps-print', 'starmaps-print', false)
on conflict (id) do nothing;

create policy "public screen-res renders are readable by anyone"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'starmaps-public');

create policy "only the service role manages screen-res renders"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'starmaps-public');

create policy "only the service role manages print assets"
  on storage.objects for all
  to service_role
  using (bucket_id = 'starmaps-print')
  with check (bucket_id = 'starmaps-print');

-- Deliberately no anon/authenticated policy of any kind on 'starmaps-print':
-- RLS defaults to deny, which is what keeps the 300dpi asset unreachable
-- from client-issued signed-URL or public-URL calls.
