-- Preserve a main product type while allowing additional category selections.
create or replace function public.sync_catalog_product() returns trigger language plpgsql set search_path=public as $$
declare types text[];
begin
 if exists(select 1 from unnest(new.term_ids) i where not exists(select 1 from public.catalog_terms t where t.id=i)) then raise exception 'Uma categoria não existe mais. Atualize o catálogo'; end if;
 if cardinality(new.term_ids)>0 then
  select array_agg(name order by name) into types from public.catalog_terms where id=any(new.term_ids) and kind='tipo';
  if coalesce(cardinality(types),0)>0 then
   if new.category is null or not(new.category=any(types)) then new.category=types[1]; end if;
   new.categories=array_remove(types,new.category);
  end if;
  select coalesce(string_agg(name,', ' order by name),'') into new.country from public.catalog_terms where id=any(new.term_ids) and kind='pais';
  select coalesce(string_agg(name,', ' order by name),new.grape,'') into new.grape from public.catalog_terms where id=any(new.term_ids) and kind='uva';
  select coalesce(string_agg(name,', ' order by name),'') into new.winery from public.catalog_terms where id=any(new.term_ids) and kind='bodega';
 end if;
 return new;
end $$;
