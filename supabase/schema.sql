-- Esprit Rénov'
-- À coller dans le SQL Editor de Supabase, une seule fois.
--
-- Comptes autorisés (créés à la main dans Authentication > Users) :
--   admin     : dylanthirion1@gmail.com
--   directeur : espritrenov10@gmail.com
-- Tout autre e-mail est refusé par le trigger.
--
-- Dashboard Supabase, à régler avant d'ajouter les utilisateurs :
--   Authentication > Sign In / Providers > Email
--   désactiver « Allow new users to sign up » (inscription publique fermée).
--   À la création d'un utilisateur : cocher « Auto Confirm User ».

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('admin', 'directeur')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nom text not null check (char_length(nom) between 2 and 120),
  telephone text not null check (char_length(telephone) between 8 and 30),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  type_travaux text not null check (type_travaux in ('Couverture', 'Zinguerie', 'Charpente', 'Autre')),
  adresse text not null check (char_length(adresse) between 2 and 200),
  ville text not null check (char_length(ville) between 2 and 80),
  code_postal text not null check (code_postal ~ '^[0-9]{5}$'),
  projet text not null check (char_length(projet) between 12 and 4000),
  statut text not null default 'nouveau' check (statut in (
    'nouveau',
    'contacte',
    'ne_repond_pas',
    'rdv_planifie',
    'devis_envoye',
    'devis_signe',
    'acompte_verse',
    'chantier_programme',
    'chantier_termine'
  ))
);

alter table public.leads add column if not exists adresse text;
alter table public.leads add column if not exists ville text;
alter table public.leads add column if not exists code_postal text;

alter table public.leads drop constraint if exists leads_adresse_len;
alter table public.leads add constraint leads_adresse_len
  check (adresse is null or char_length(adresse) between 2 and 200);

alter table public.leads drop constraint if exists leads_ville_len;
alter table public.leads add constraint leads_ville_len
  check (ville is null or char_length(ville) between 2 and 80);

alter table public.leads drop constraint if exists leads_code_postal_format;
alter table public.leads add constraint leads_code_postal_format
  check (code_postal is null or code_postal ~ '^[0-9]{5}$');

create index if not exists leads_statut_created_idx on public.leads (statut, created_at desc);

create table if not exists public.lead_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  statut text not null check (statut in (
    'nouveau',
    'contacte',
    'ne_repond_pas',
    'rdv_planifie',
    'devis_envoye',
    'devis_signe',
    'acompte_verse',
    'chantier_programme',
    'chantier_termine'
  )),
  date_heure timestamptz,
  constraint lead_history_date_heure_check check (
    (
      statut in ('ne_repond_pas', 'rdv_planifie', 'acompte_verse', 'chantier_programme')
      and date_heure is not null
    )
    or (
      statut not in ('ne_repond_pas', 'rdv_planifie', 'acompte_verse', 'chantier_programme')
      and date_heure is null
    )
  ),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists lead_history_lead_created_idx on public.lead_history (lead_id, created_at desc);

create table if not exists public.realisations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  titre text not null check (char_length(titre) between 2 and 140),
  description text not null default '' check (char_length(description) <= 2000),
  categorie text not null check (categorie in ('Couverture', 'Zinguerie', 'Charpente')),
  avant_url text,
  apres_url text,
  ordre integer not null default 0,
  publie boolean not null default false,
  mise_en_avant boolean not null default false
);

alter table public.realisations add column if not exists mise_en_avant boolean not null default false;
alter table public.realisations add column if not exists avant_url text;
alter table public.realisations add column if not exists apres_url text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'realisations'
      and column_name = 'image_url'
  ) then
    execute 'update public.realisations set apres_url = image_url where apres_url is null';
    execute 'alter table public.realisations drop column image_url';
  end if;
end $$;

create index if not exists realisations_publie_ordre_idx on public.realisations (publie, ordre);

-- ---------------------------------------------------------------------------
-- Helpers (security definer : pas de récursion avec les policies)
-- ---------------------------------------------------------------------------

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

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'directeur')
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_staff() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Profil créé à l'inscription. Autre e-mail = accès refusé.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := lower(trim(new.email));
  assigned_role text;
begin
  if normalized = 'dylanthirion1@gmail.com' then
    assigned_role := 'admin';
  elsif normalized = 'espritrenov10@gmail.com' then
    assigned_role := 'directeur';
  else
    raise exception 'Inscription non autorisée pour %', new.email
      using errcode = '42501';
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, normalized, assigned_role)
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Une demande publique est toujours « nouveau ».
create or replace function public.force_new_lead()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.statut := 'nouveau';
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists leads_force_new on public.leads;
create trigger leads_force_new
  before insert on public.leads
  for each row execute function public.force_new_lead();

create or replace function public.log_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lead_history (lead_id, statut, date_heure, created_by)
  values (new.id, new.statut, null, auth.uid());
  return new;
end;
$$;

revoke all on function public.log_new_lead() from public;

drop trigger if exists leads_log_created on public.leads;
create trigger leads_log_created
  after insert on public.leads
  for each row execute function public.log_new_lead();

-- ---------------------------------------------------------------------------
-- Droits
-- ---------------------------------------------------------------------------

revoke all on public.profiles from anon;
revoke all on public.leads from anon;
revoke all on public.lead_history from anon;
revoke all on public.realisations from anon;

grant select, update on public.profiles to authenticated;
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.lead_history to authenticated;
grant select on public.realisations to anon, authenticated;
grant insert, update, delete on public.realisations to authenticated;

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_history enable row level security;
alter table public.realisations enable row level security;

-- Profiles : chacun lit sa ligne, seul l'admin lit et modifie l'ensemble.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin() and role in ('admin', 'directeur'));

-- Leads : un visiteur anonyme peut seulement créer une demande.
drop policy if exists "leads_insert" on public.leads;
create policy "leads_insert"
  on public.leads for insert
  to anon, authenticated
  with check (statut = 'nouveau');

drop policy if exists "leads_select_staff" on public.leads;
create policy "leads_select_staff"
  on public.leads for select
  to authenticated
  using (public.is_staff());

drop policy if exists "leads_update_staff" on public.leads;
create policy "leads_update_staff"
  on public.leads for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff() and statut in (
    'nouveau',
    'contacte',
    'ne_repond_pas',
    'rdv_planifie',
    'devis_envoye',
    'devis_signe',
    'acompte_verse',
    'chantier_programme',
    'chantier_termine'
  ));

drop policy if exists "lead_history_select_staff" on public.lead_history;
create policy "lead_history_select_staff"
  on public.lead_history for select
  to authenticated
  using (public.is_staff());

drop policy if exists "lead_history_insert_staff" on public.lead_history;
create policy "lead_history_insert_staff"
  on public.lead_history for insert
  to authenticated
  with check (public.is_staff() and created_by = auth.uid());

drop policy if exists "lead_history_update_staff" on public.lead_history;
create policy "lead_history_update_staff"
  on public.lead_history for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "lead_history_delete_staff" on public.lead_history;
create policy "lead_history_delete_staff"
  on public.lead_history for delete
  to authenticated
  using (public.is_staff());

drop policy if exists "leads_delete_staff" on public.leads;
create policy "leads_delete_staff"
  on public.leads for delete
  to authenticated
  using (public.is_staff());

-- Réalisations : lecture publique uniquement si publié.
drop policy if exists "realisations_select" on public.realisations;
create policy "realisations_select"
  on public.realisations for select
  to anon, authenticated
  using (publie = true or public.is_staff());

drop policy if exists "realisations_insert_staff" on public.realisations;
create policy "realisations_insert_staff"
  on public.realisations for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists "realisations_update_staff" on public.realisations;
create policy "realisations_update_staff"
  on public.realisations for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "realisations_delete_staff" on public.realisations;
create policy "realisations_delete_staff"
  on public.realisations for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- Storage : bucket public en lecture
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'realisations',
  'realisations',
  true,
  52428800,
  null
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "realisations_public_read" on storage.objects;
create policy "realisations_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'realisations');

drop policy if exists "realisations_staff_insert" on storage.objects;
create policy "realisations_staff_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'realisations' and public.is_staff());

drop policy if exists "realisations_staff_update" on storage.objects;
create policy "realisations_staff_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'realisations' and public.is_staff())
  with check (bucket_id = 'realisations' and public.is_staff());

drop policy if exists "realisations_staff_delete" on storage.objects;
create policy "realisations_staff_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'realisations' and public.is_staff());
