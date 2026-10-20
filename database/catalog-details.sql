alter table public.catalog_terms add column if not exists country text;
alter table public.catalog_terms add column if not exists logo_url text;
alter table public.catalog_terms add column if not exists active boolean not null default true;
alter table public.catalog_terms drop constraint if exists catalog_terms_kind_check;
alter table public.catalog_terms add constraint catalog_terms_kind_check check (kind in ('tipo','uva','pais','bodega','colecao','regiao'));
alter table public.products
 add column if not exists region text,
 add column if not exists vintage text,
 add column if not exists volume_ml integer check (volume_ml is null or volume_ml>0),
 add column if not exists alcohol text,
 add column if not exists aging text,
 add column if not exists visual text,
 add column if not exists aromas text,
 add column if not exists palate text,
 add column if not exists tasting_notes text,
 add column if not exists pairing text,
 add column if not exists serving_temperature text,
 add column if not exists categories text[] not null default '{}',
 add column if not exists in_stock boolean not null default true,
 add column if not exists promotion_scope text not null default 'pix' check (promotion_scope in ('pix','card','all')),
 add column if not exists slug text;

-- Slugs use the product name. A short numeric suffix is used only for a real collision.
create or replace function public.catalog_product_slug() returns trigger language plpgsql set search_path=public as $$
declare base text; candidate text; suffix integer:=1;
begin
 if new.slug is null or btrim(new.slug)='' then
  base=trim(both '-' from regexp_replace(lower(translate(new.name,'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑáàâãäéèêëíìîïóòôõöúùûüçñ','AAAAAEEEEIIIIOOOOOUUUUCNaaaaaeeeeiiiiooooouuuucn')),'[^a-z0-9]+','-','g'));
  if base='' then base='vinho'; end if;
  if base in ('adm','loja','politicas','vinho','videira-logo','manutencao') then base='vinho-'||base; end if;
  candidate=base;
  while exists(select 1 from public.products p where p.slug=candidate and p.id is distinct from new.id) loop suffix=suffix+1; candidate=base||'-'||suffix; end loop;
  new.slug=candidate;
 end if;
 return new;
end $$;
drop trigger if exists catalog_product_slug on public.products;
create trigger catalog_product_slug before insert or update of name,slug on public.products for each row execute function public.catalog_product_slug();
update public.products set slug=null where slug is null;
create unique index if not exists products_slug_unique on public.products(slug);
create index if not exists products_country_region on public.products(country,region) where active;
create index if not exists catalog_terms_country_kind on public.catalog_terms(country,kind);
alter table public.catalog_terms enable row level security;
alter table public.products enable row level security;

-- Populate option lists only from names already stored in the real catalog.
insert into public.catalog_terms(kind,name) select distinct 'pais',btrim(country) from public.products where nullif(btrim(country),'') is not null on conflict(kind,name) do nothing;
insert into public.catalog_terms(kind,name) select distinct 'tipo',btrim(category) from public.products where nullif(btrim(category),'') is not null on conflict(kind,name) do nothing;
insert into public.catalog_terms(kind,name) select distinct 'tipo',btrim(name) from public.product_categories where nullif(btrim(name),'') is not null on conflict(kind,name) do nothing;
insert into public.catalog_terms(kind,name) select distinct 'uva',btrim(grape) from public.products where nullif(btrim(grape),'') is not null on conflict(kind,name) do nothing;
insert into public.catalog_terms(kind,name) select distinct 'bodega',btrim(winery) from public.products where nullif(btrim(winery),'') is not null on conflict(kind,name) do nothing;

alter table public.catalog_terms add column if not exists country_id uuid references public.catalog_terms(id) on delete restrict;
create index if not exists catalog_terms_country_id on public.catalog_terms(country_id);
