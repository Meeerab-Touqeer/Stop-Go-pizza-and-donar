-- STOP&GO Pizza & Doner
-- Run this in the Supabase SQL editor, then start the API with the service role key.
-- The API loads the menu on first boot when the categories table is empty.

create extension if not exists pgcrypto;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  description text not null,
  base_price numeric(10,2) not null check (base_price >= 0),
  compare_at numeric(10,2),
  image text,
  rating numeric(2,1) not null default 4.8,
  preparation_time integer not null default 15,
  calories integer not null default 0,
  is_available boolean not null default true,
  is_vegetarian boolean not null default false,
  is_spicy boolean not null default false,
  discount_percent integer not null default 0,
  customizer text not null default 'simple' check (customizer in ('pizza', 'doner', 'simple')),
  allergens text[] not null default '{}',
  defaults jsonb not null default '{}',
  featured boolean not null default false,
  builder boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null default 0,
  category text not null,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists product_ingredients (
  product_id uuid not null references products(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  primary key (product_id, ingredient_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  discount_code text,
  tax numeric(10,2) not null,
  total numeric(10,2) not null,
  status text not null default 'received' check (
    status in ('received', 'preparing', 'cooking', 'out_for_delivery', 'delivered', 'cancelled')
  ),
  payment_method text not null default 'cod' check (payment_method in ('cod', 'card', 'stripe')),
  delivery_address text not null,
  delivery_instructions text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  image text,
  quantity integer not null check (quantity > 0 and quantity <= 20),
  base_price numeric(10,2) not null,
  customization_price numeric(10,2) not null,
  total_price numeric(10,2) not null
);

create table if not exists order_item_options (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  option_type text not null,
  option_name text not null,
  price numeric(10,2) not null default 0
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  product_id uuid references products(id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on products(category_id);
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_created_idx on orders(created_at desc);
create index if not exists order_items_order_idx on order_items(order_id);
create index if not exists reviews_product_idx on reviews(product_id);

alter table users enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table ingredients enable row level security;
alter table product_ingredients enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_item_options enable row level security;
alter table reviews enable row level security;
alter table messages enable row level security;

create policy "read own profile" on users
  for select using (auth.uid() = id or is_admin());

create policy "admin manage users" on users
  for all using (is_admin()) with check (is_admin());

create policy "public read categories" on categories
  for select using (true);

create policy "admin manage categories" on categories
  for all using (is_admin()) with check (is_admin());

create policy "public read products" on products
  for select using (is_available = true or is_admin());

create policy "admin manage products" on products
  for all using (is_admin()) with check (is_admin());

create policy "public read ingredients" on ingredients
  for select using (true);

create policy "admin manage ingredients" on ingredients
  for all using (is_admin()) with check (is_admin());

create policy "public read recipe links" on product_ingredients
  for select using (true);

create policy "admin manage recipe links" on product_ingredients
  for all using (is_admin()) with check (is_admin());

create policy "read own orders" on orders
  for select using (auth.uid() = user_id or is_admin());

create policy "admin manage orders" on orders
  for all using (is_admin()) with check (is_admin());

create policy "read own order items" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );

create policy "read own item options" on order_item_options
  for select using (
    exists (
      select 1 from order_items
      join orders on orders.id = order_items.order_id
      where order_items.id = order_item_options.order_item_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );

create policy "public read reviews" on reviews
  for select using (true);

create policy "customers write own reviews" on reviews
  for insert with check (auth.uid() = user_id);

create policy "admin manage reviews" on reviews
  for all using (is_admin()) with check (is_admin());

create policy "admin read messages" on messages
  for select using (is_admin());

grant usage on schema public to anon, authenticated;
grant select on categories, products, ingredients, product_ingredients, reviews to anon, authenticated;
grant select on users, orders, order_items, order_item_options to authenticated;

-- Mirror new auth users into the public profile table.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
