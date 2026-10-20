import original from './original.json';
export const dynamic='force-static';
export function GET(){
 // Original pixels and file are preserved. The viewBox excludes only transparent margins.
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="14 23 2247 787"><image width="2500" height="834" href="data:image/png;base64,'+original.data+'"/></svg>';
 return new Response(svg,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=86400'}});
}
