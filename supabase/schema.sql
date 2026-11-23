create extension if not exists pgcrypto;
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Acessórios',
  description text not null default '',
  price numeric(10,2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;

-- A vitrine pode ser consultada por qualquer visitante.
drop policy if exists "Produtos visíveis publicamente" on public.products;
create policy "Produtos visíveis publicamente"
on public.products for select using (true);

-- Somente usuários cujo app_metadata.role seja "admin" podem alterar o catálogo.
-- Defina essa claim no Supabase Auth para o usuário administrador.
drop policy if exists "Admin pode inserir produtos" on public.products;
create policy "Admin pode inserir produtos"
on public.products for insert to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admin pode editar produtos" on public.products;
create policy "Admin pode editar produtos"
on public.products for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admin pode excluir produtos" on public.products;
create policy "Admin pode excluir produtos"
on public.products for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Depois de criar o usuário no Supabase Auth, marque-o como administrador
-- no app_metadata pelo painel administrativo seguro ou pelo backend.
-- Nunca coloque a chave service_role no frontend.
-- Para imagens, crie um bucket product-images e aplique políticas equivalentes
-- que permitam upload somente a usuários com app_metadata.role = 'admin'.