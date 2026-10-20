'use client';
import { useEffect, useRef, useState } from 'react';
import { loadWineImage } from './catalogLoader';

const processedCache=new Map();

function distance(a,b){
  const dr=a[0]-b[0],dg=a[1]-b[1],db=a[2]-b[2];
  return Math.sqrt(dr*dr+dg*dg+db*db);
}

function average(colors){
  return [
    colors.reduce((s,c)=>s+c[0],0)/colors.length,
    colors.reduce((s,c)=>s+c[1],0)/colors.length,
    colors.reduce((s,c)=>s+c[2],0)/colors.length
  ];
}

function conservativeCutout(img){
  const maxSide=620;
  const scale=Math.min(1,maxSide/Math.max(img.naturalWidth||1,img.naturalHeight||1));
  const w=Math.max(1,Math.round(img.naturalWidth*scale));
  const h=Math.max(1,Math.round(img.naturalHeight*scale));
  const canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(img,0,0,w,h);
  const image=ctx.getImageData(0,0,w,h);
  const p=image.data;
  const at=(x,y)=>{const i=(y*w+x)*4;return [p[i],p[i+1],p[i+2],p[i+3]]};

  // If the file already has real transparency, preserve it exactly.
  let transparent=0;
  for(let i=3;i<p.length;i+=Math.max(4,Math.floor(p.length/1500/4)*4)) if(p[i]<245) transparent++;
  if(transparent>12) return img.src;

  const xs=[0,Math.floor(w*.08),Math.floor(w*.92),w-1];
  const ys=[0,Math.floor(h*.08),Math.floor(h*.92),h-1];
  const samples=[
    at(0,0),at(w-1,0),at(0,h-1),at(w-1,h-1),
    at(Math.floor(w/2),0),at(Math.floor(w/2),h-1),
    at(0,Math.floor(h/2)),at(w-1,Math.floor(h/2)),
    ...xs.flatMap(x=>[at(x,0),at(x,h-1)]),
    ...ys.flatMap(y=>[at(0,y),at(w-1,y)])
  ].filter(c=>c[3]>240).map(c=>c.slice(0,3));

  if(samples.length<8) return img.src;
  const bg=average(samples);
  const consistency=samples.reduce((s,c)=>s+distance(c,bg),0)/samples.length;

  // Only attempt removal on genuinely flat studio backgrounds.
  if(consistency>22) return img.src;

  const lum=(bg[0]+bg[1]+bg[2])/3;
  const isVeryDark=lum<45;
  const isVeryLight=lum>210;
  if(!isVeryDark&&!isVeryLight) return img.src;

  const hard=isVeryDark?13:18;
  const soft=isVeryDark?25:34;

  for(let i=0;i<p.length;i+=4){
    const d=distance([p[i],p[i+1],p[i+2]],bg);
    if(d<=hard){
      p[i+3]=0;
    }else if(d<soft){
      const alpha=Math.round(255*(d-hard)/(soft-hard));
      p[i+3]=Math.min(p[i+3],alpha);
    }
  }

  ctx.putImageData(image,0,0);
  return canvas.toDataURL('image/png');
}

export default function WineThumb({wine,className='wine-photo'}){
 const ref=useRef(null);
 const [src,setSrc]=useState(wine?.image_url||'');
 const [display,setDisplay]=useState('');

 useEffect(()=>{
   if(src||!wine?.id)return;
   const el=ref.current;
   let active=true,observer;
   const load=()=>loadWineImage(wine.id).then(url=>{if(active&&url)setSrc(url)}).catch(()=>{});
   if('IntersectionObserver' in window&&el){
     observer=new IntersectionObserver(entries=>{if(entries[0]?.isIntersecting){observer.disconnect();load()}},{rootMargin:'300px'});
     observer.observe(el);
   }else load();
   return()=>{active=false;observer?.disconnect()};
 },[wine?.id,src]);

 useEffect(()=>{
   if(!src){setDisplay('');return}
   if(processedCache.has(src)){setDisplay(processedCache.get(src));return}
   let alive=true;
   const img=new Image();
   img.onload=()=>{
     let out=src;
     try{out=conservativeCutout(img)}catch{}
     processedCache.set(src,out);
     if(alive)setDisplay(out);
   };
   img.onerror=()=>alive&&setDisplay('');
   img.src=src;
   return()=>{alive=false};
 },[src]);

 if(!display)return <span ref={ref} className="wine-photo-placeholder" role="img" aria-label="Foto do produto indisponível"><svg viewBox="0 0 80 180" aria-hidden="true"><path d="M30 8h20v48c0 16 17 20 17 40v72H13V96c0-20 17-24 17-40Z"/><path d="M14 103h52v40H14"/></svg><small>Imagem em atualização</small></span>;
 const webSource=/^https?:\/\//i.test(src);
 return <img ref={ref} className={`${className} ${webSource?'web-photo':''}`} src={display} alt={wine?.name||'Rótulo de vinho'} onError={()=>setDisplay('')} loading="lazy" decoding="async" draggable="false"/>;
}
