'use client';

const SUPABASE_URL='https://rmyybeaepscmzbddnvzr.supabase.co';
const SUPABASE_KEY='sb_publishable_lINNHBmZk9rvHYgtQetewg_NTRAEWq2';

let catalogPromise;

function toneFor(w){
  const s=[w.grape,w.name,w.type].filter(Boolean).join(' ').toLowerCase();
  if(s.includes('rosé')||s.includes('rose')) return 'pinot';
  if(s.includes('pinot noir')) return 'pinot';
  if(s.includes('malbec')) return 'malbec';
  if(s.includes('chardonnay')||s.includes('sauvignon blanc')||s.includes('riesling')||s.includes('moscatel')||s.includes('moscato')||s.includes('glera')||s.includes('prosecco')||s.includes('branco')) return 'gold';
  if(s.includes('cabernet')||s.includes('tannat')||s.includes('syrah')||s.includes('shiraz')||s.includes('pinotage')) return 'cabernet';
  return 'blend';
}

function isBlend(raw=''){
  const s=String(raw).trim();
  if(!s) return false;
  const pct=(s.match(/\d+(?:[.,]\d+)?\s*%/g)||[]).length;
  return pct>1 || /,|\s+e\s+|\s*&\s*|\s*\/\s*|\s*\+\s*/i.test(s) || /\boutras?\b|\bblend\b/i.test(s);
}

function canonicalPure(value=''){
  let v=String(value)
    .replace(/^\s*\d+(?:[.,]\d+)?\s*%\s*/,'')
    .replace(/\s+/g,' ')
    .trim();
  if(/^cabernet[-\s]sauvignon$/i.test(v)) return 'Cabernet Sauvignon';
  if(/^carmenere$/i.test(v)||/^carménère$/i.test(v)) return 'Carménère';
  if(/^sangiovese grosso$/i.test(v)) return 'Sangiovese';
  return v;
}

export function grapeCategory(raw){
  if(!raw) return '';
  if(isBlend(raw)) return 'Blends';
  return canonicalPure(raw);
}

export function grapeDisplay(raw){
  if(!raw) return '';
  if(isBlend(raw)) return String(raw).replace(/\s+/g,' ').trim();
  return canonicalPure(raw);
}

export function slugify(value=''){
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

export function wineSlug(w){
  return slugify(w?.name||'vinho');
}
export function winePath(w){return `/${wineSlug(w)}`;}
export function wineIdFromSlug(slug=''){
  const clean=decodeURIComponent(String(slug).split('?')[0]).replace(/\/+$/,'');
  const marker=clean.lastIndexOf('--');
  return marker>=0?clean.slice(marker+2):clean;
}

function normalize(w){
  const item={
    ...w,
    flag:w.country_code||'',
    notes:w.tasting_notes||'',
    source:w.source_catalog||'',
    sourcePage:w.source_page,
    isNew:Boolean(w.new_arrival),
  };
  item.tone=toneFor(item);
  item.filterGrape=grapeCategory(item.grape);
  item.grapeDisplay=grapeDisplay(item.grape);
  return item;
}

async function fetchRows(query){
  const response=await fetch(SUPABASE_URL+'/rest/v1/products?'+query,{headers:{apikey:SUPABASE_KEY},cache:'no-store'});
  if(!response.ok) throw new Error('Não foi possível carregar o catálogo.');
  return response.json();
}

export function loadCatalog(){
  if(!catalogPromise){
    catalogPromise=(async()=>{
      const rows=await fetchRows('select=id,name,winery,country,country_code,region,grape,alcohol,aging,type,tasting_notes,price,source_catalog,source_page,new_arrival,featured,active,in_stock,sort_order&active=eq.true&order=sort_order.asc');
      return rows.map(normalize);
    })();
  }
  return catalogPromise;
}

const imageCache=new Map();
export async function loadWineImage(id){
  if(!id)return '';
  if(imageCache.has(id))return imageCache.get(id);
  const rows=await fetchRows('select=id,image_url&id=eq.'+encodeURIComponent(id)+'&active=eq.true&limit=1');
  const url=rows[0]?.image_url||'';
  imageCache.set(id,url);
  return url;
}

export async function loadWineById(id){
  if(!id)return null;
  const rows=await fetchRows('select=*&active=eq.true&id=eq.'+encodeURIComponent(id)+'&limit=1');
  return rows[0]?normalize(rows[0]):null;
}

export async function loadRelatedWines(winery,excludeId,limit=12){
  if(!winery)return [];
  const fields='id,name,winery,country,country_code,region,grape,alcohol,aging,type,tasting_notes,price,source_catalog,source_page,new_arrival,featured,active,in_stock,sort_order';
  const q='select='+fields+'&active=eq.true&winery=eq.'+encodeURIComponent(winery)+'&id=neq.'+encodeURIComponent(excludeId||'')+'&order=sort_order.asc&limit='+Number(limit||12);
  const rows=await fetchRows(q);
  return rows.map(normalize);
}

export function money(value){
  return Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}


let wineryPromise;
export function loadWineries(){
  if(!wineryPromise){
    wineryPromise=(async()=>{
      const response=await fetch(SUPABASE_URL+'/rest/v1/wineries?select=id,name,logo_url,active&active=eq.true&order=name.asc',{headers:{apikey:SUPABASE_KEY},cache:'no-store'});
      if(!response.ok)return [];
      return response.json();
    })();
  }
  return wineryPromise;
}

export function pixPrice(w){return Number(w?.price_pix ?? w?.price ?? 0)}
export function cardPrice(w){const n=Number(w?.price_card ?? w?.card_price ?? w?.preco_cartao ?? 0);return Number.isFinite(n)&&n>0?n:null}
