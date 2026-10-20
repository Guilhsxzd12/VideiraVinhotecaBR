'use client';
const URL='https://lahajlrombmoftevweaf.supabase.co';
const KEY='sb_publishable_ixLS7JIsBDtPF75R-rZwcA_2eAD0bKV';
const TOKEN='videira-admin-token',REFRESH='videira-admin-refresh';
export async function signInAdmin(username,password){
 if(username.trim().toLowerCase()!=='videira')throw new Error('Usuário ou senha incorretos.');
 const response=await fetch(URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:KEY,'content-type':'application/json'},body:JSON.stringify({email:'videiravinhoteca@gmail.com',password})});const data=await response.json();
 if(!response.ok)throw new Error(response.status===429?'Aguarde alguns minutos antes de tentar novamente.':'Usuário ou senha incorretos.');
 if(data.user?.app_metadata?.role!=='admin')throw new Error('Esta conta não tem permissão de administrador.');
 sessionStorage.setItem(REFRESH,data.refresh_token);return {token:data.access_token};
}
async function request(path,options={},retry=true){
 const response=await fetch(URL+path,{...options,headers:{apikey:KEY,Authorization:'Bearer '+(sessionStorage.getItem(TOKEN)||''),'content-type':'application/json',...options.headers}});
 if(response.status===401&&retry){const refresh=sessionStorage.getItem(REFRESH);if(refresh){const r=await fetch(URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'content-type':'application/json'},body:JSON.stringify({refresh_token:refresh})});const d=await r.json();if(r.ok){sessionStorage.setItem(TOKEN,d.access_token);sessionStorage.setItem(REFRESH,d.refresh_token);return request(path,options,false)}}throw new Error('unauthorized: Sua sessão expirou. Entre novamente.');}
 if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(response.status===403?'Sua conta não tem permissão para esta ação.':data.message||'Não foi possível concluir a ação.');}return response;
}
const entities={products:{table:'products',key:'id'},categories:{table:'product_categories',key:'name'},wineries:{table:'catalog_terms',key:'id',kind:'bodega'},grapes:{table:'catalog_terms',key:'id',kind:'uva'}};
export async function adminCall(body){
 if(body.action==='logout'){try{await request('/auth/v1/logout',{method:'POST'})}finally{sessionStorage.removeItem(TOKEN);sessionStorage.removeItem(REFRESH)}return {};}
 const config=entities[body.entity];if(!config)throw new Error('Seção inválida.');const query=new URLSearchParams();if(config.kind)query.set('kind','eq.'+config.kind);
 if(body.action==='list'){query.set('select','*');query.set('order','name.asc');if(body.q?.trim())query.set('name','ilike.*'+body.q.trim()+'*');const size=Math.min(100,Math.max(1,Number(body.pageSize)||40)),start=(Math.max(1,Number(body.page)||1)-1)*size;const response=await request('/rest/v1/'+config.table+'?'+query,{headers:{Prefer:'count=exact',Range:start+'-'+(start+size-1)}});const rows=await response.json();return {items:rows.map(row=>body.entity==='products'?{...row,type:row.category||'',tasting_notes:row.description||''}:{...row,id:row.id||row.name,active:true}),count:Number(response.headers.get('content-range')?.split('/')[1])||rows.length};}
 if(body.action==='delete'){if(!body.id)throw new Error('Registro inválido.');query.set(config.key,'eq.'+body.id);await request('/rest/v1/'+config.table+'?'+query,{method:'DELETE'});return {};}
 if(body.action==='save'){const data=body.data||{};if(!String(data.name||'').trim())throw new Error('Informe o nome.');let payload;if(body.entity==='products'){payload={};for(const key of ['name','country','grape','winery','image_url','price','active','featured','pix_price','card_price','sale_price','promotion_start','promotion_end'])if(data[key]!==undefined)payload[key]=data[key];payload.category=data.type||'';payload.description=data.tasting_notes||'';for(const key of ['price','pix_price','card_price','sale_price'])if(payload[key]!==undefined&&payload[key]!==null){payload[key]=Number(payload[key]);if(!Number.isFinite(payload[key])||payload[key]<0)throw new Error('Informe preços válidos.');}}else payload={name:String(data.name).trim(),...(config.kind?{kind:config.kind}:{})};if(data.id){query.set(config.key,'eq.'+data.id);await request('/rest/v1/'+config.table+'?'+query,{method:'PATCH',body:JSON.stringify(payload)});}else await request('/rest/v1/'+config.table,{method:'POST',body:JSON.stringify(payload)});return {};}
 throw new Error('Ação inválida.');
}
