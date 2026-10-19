const URL='https://lahajlrombmoftevweaf.supabase.co';
const KEY='sb_publishable_ixLS7JIsBDtPF75R-rZwcA_2eAD0bKV';
export async function getInitialProducts(){try{const response=await fetch(URL+'/rest/v1/products?select=*&active=eq.true&order=name.asc',{headers:{apikey:KEY},next:{revalidate:60},signal:AbortSignal.timeout(3500)});if(!response.ok)return [];const rows=await response.json();return Array.isArray(rows)?rows:[]}catch{return []}}
