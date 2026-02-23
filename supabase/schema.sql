create table if not exists public.closers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sales_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  month_key text not null,
  ad_spend numeric(12,2) not null default 0,
  leads integer not null default 0,
  appointments integer not null default 0,
  no_shows integer not null default 0,
  lost_at_scheduling integer not null default 0,
  closer_id uuid references public.closers(id) on delete restrict,
  result text not null check (result in ('FOLLOW_UP','CLOSED','LOST')),
  amount numeric(12,2),
  payment_type text check (payment_type in ('FULL','INSTALLMENT')),
  installment_amount numeric(12,2),
  installment_count integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_month_key on public.sales_entries(month_key);
create index if not exists idx_sales_closer_id on public.sales_entries(closer_id);

alter table public.closers enable row level security;
alter table public.sales_entries enable row level security;

create policy "allow all closers" on public.closers for all using (true) with check (true);
create policy "allow all sales_entries" on public.sales_entries for all using (true) with check (true);

insert into public.closers(name) values ('Alex') on conflict (name) do nothing;
insert into public.closers(name) values ('Niklas') on conflict (name) do nothing;
