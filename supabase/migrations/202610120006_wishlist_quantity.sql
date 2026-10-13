alter table public.wishlists
  add column if not exists quantity integer not null default 1
  check (quantity > 0);
