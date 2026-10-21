'use client';
import {request} from './adminApi';
const entities={products:{table:'products',key:'id'},categories:{table:'catalog_terms',key:'id',kind:'tipo'},wineries:{table:'catalog_terms',key:'id',kind:'bodega'},grapes:{table:'catalog_terms',key:'id',kind:'uva'},countries:{table:'catalog_terms',key:'id',kind:'pais'},regions:{table:'catalog_terms',key:'id',kind:'regiao'}};
export async function loadAdminOptions(includeInactive=false){const response=await request('/rest/v1/catalog_terms?select=*&order=name.asc');const original=await response.json();const rows=original.map(row=>row.country_id?{...row,country:original.find(c=>c.id===row.country_id)?.name||row.country}:row);return Object.fromEntries(Object.entries(entities).filter(([,c])=>c.kind).map(([key,c])=>[key,rows.filter(r=>r.kind===c.kind&&(includeInactive||r.active!==false))]));}
export async function adminCall(body){
 if(body.action==='logout'){try{await request('/auth/v1/logout',{method:'POST'})}finally{sessionStorage.removeItem('videira-admin-token');sessionStorage.removeItem('videira-admin-refresh')}return {};}
 const config=entities[body.entity];if(!config)throw new Error('Seção inválida.');const query=new URLSearchParams();if(config.kind)query.set('kind','eq.'+config.kind);
 if(body.action==='list'){query.set('select','*');query.set('order','name.asc');if(body.q?.trim())query.set('name','ilike.*'+body.q.trim()+'*');const size=Math.min(100,Math.max(1,Number(body.pageSize)||40)),start=(Math.max(1,Number(body.page)||1)-1)*size;const response=await request('/rest/v1/'+config.table+'?'+query,{headers:{Prefer:'count=exact',Range:start+'-'+(start+size-1)}});const rows=await response.json();return {items:rows.map(row=>body.entity==='products'?{...row,type:row.category||''}:row),count:Number(response.headers.get('content-range')?.split('/')[1])||rows.length};}
 if(body.action==='set_active'){if(body.entity!=='products'||!body.id||typeof body.active!=='boolean')throw new Error('Produto inválido.');query.set('id','eq.'+body.id);const response=await request('/rest/v1/products?'+query,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({active:body.active})});const rows=await response.json();if(!rows[0])throw new Error('Produto não encontrado ou sem permissão para alterar.');return {item:rows[0]};}
 if(body.action==='delete'){if(!body.id)throw new Error('Registro inválido.');if(body.entity!=='products'){const used=await request('/rest/v1/products?select=id&term_ids=cs.'+encodeURIComponent('{'+body.id+'}')+'&limit=1');if((await used.json()).length)throw new Error('Este cadastro é usado por produtos. Altere os vínculos antes de excluir.');}query.set('id','eq.'+body.id);await request('/rest/v1/'+config.table+'?'+query,{method:'DELETE'});return {};}
 if(body.action==='save'){
  const data=body.data||{};if(!String(data.name||'').trim())throw new Error('Informe o nome.');let payload;
  if(body.entity==='products'){
   payload={};for(const key of ['name','country','state','region','grape','grape_is_blend','winery','categories','image_url','price','active','featured','in_stock','pix_price','card_price','sale_price','promotion_start','promotion_end','promotion_scope','description','vintage','volume_ml','alcohol','aging','visual','aromas','palate','tasting_notes','pairing','serving_temperature'])if(data[key]!==undefined)payload[key]=data[key];payload.category=data.type||'';
   const options=await loadAdminOptions(true);
   if(payload.region&&!options.regions.some(r=>r.name===payload.region&&r.country===payload.country))throw new Error('Selecione uma região do país escolhido.');
   const chosen={categories:[payload.category,...(payload.categories||[])],countries:[payload.country],regions:[payload.region],grapes:[payload.grape],wineries:[payload.winery]};
   payload.term_ids=Object.entries(chosen).flatMap(([kind,names])=>options[kind].filter(term=>names.includes(term.name)&&(kind!=='regions'||term.country===payload.country)).map(term=>term.id));
   for(const key of ['price','pix_price','card_price','sale_price'])if(payload[key]!==undefined&&payload[key]!==null){payload[key]=Number(payload[key]);if(!Number.isFinite(payload[key])||payload[key]<0)throw new Error('Informe preços válidos.');}
   if(payload.sale_price!=null&&payload.sale_price>=Number(payload.price))throw new Error('O preço promocional deve ser menor que o preço normal.');
   if(payload.pix_price!=null&&payload.pix_price>Number(payload.price))throw new Error('O valor no Pix não pode superar o preço normal.');
   if(payload.volume_ml!==undefined&&payload.volume_ml!==null&&(!Number.isInteger(Number(payload.volume_ml))||Number(payload.volume_ml)<=0))throw new Error('Informe um volume válido em ml.');
   for(const key of ['promotion_start','promotion_end'])if(payload[key])payload[key]=new Date(payload[key]).toISOString();else if(payload[key]!==undefined)payload[key]=null;
   if(payload.promotion_start&&payload.promotion_end&&payload.promotion_end<payload.promotion_start)throw new Error('O fim da promoção deve ser posterior ao início.');
  }else{
   payload={name:String(data.name).trim(),kind:config.kind,active:data.active!==false};
   if(body.entity==='regions'&&!data.country)throw new Error('Selecione o país da região.');
   if(['wineries','regions'].includes(body.entity)&&data.country){const options=await loadAdminOptions();const country=options.countries.find(c=>c.name===data.country);if(!country)throw new Error('Cadastre ou selecione um país existente.');payload.country=country.name;payload.country_id=country.id;}
   if(body.entity==='wineries'){payload.logo_url=data.logo_url||null;if(!data.country){payload.country=null;payload.country_id=null;}}
  }
  if(data.id)query.set('id','eq.'+data.id);const response=await request('/rest/v1/'+config.table+(data.id?'?'+query:''),{method:data.id?'PATCH':'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});const rows=await response.json();return {item:rows[0]};
 }
 throw new Error('Ação inválida.');
}
