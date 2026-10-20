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
export async function request(path,options={},retry=true){
 const response=await fetch(URL+path,{...options,headers:{apikey:KEY,Authorization:'Bearer '+(sessionStorage.getItem(TOKEN)||''),'content-type':'application/json',...options.headers}});
 if(response.status===401&&retry){const refresh=sessionStorage.getItem(REFRESH);if(refresh){const r=await fetch(URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'content-type':'application/json'},body:JSON.stringify({refresh_token:refresh})});const d=await r.json();if(r.ok){sessionStorage.setItem(TOKEN,d.access_token);sessionStorage.setItem(REFRESH,d.refresh_token);return request(path,options,false)}}throw new Error('unauthorized: Sua sessão expirou. Entre novamente.');}
 if(!response.ok){const data=await response.json().catch(()=>({}));if(data.code==='23505')throw new Error('Já existe um cadastro com esse nome. Selecione a opção existente.');if(data.code==='23503')throw new Error('Este cadastro está vinculado a outros registros e não pode ser excluído.');throw new Error(response.status===403?'Sua conta não tem permissão para esta ação.':data.message||'Não foi possível concluir a ação.');}return response;
}
export {adminCall,loadAdminOptions} from './catalogActions';
