'use client';
import Link from 'next/link';
import {StoreShell} from '../Storefront';

export default function PolicyLayout({title,intro,sections}){
 return <StoreShell>{()=> <main id="conteudo" className="policy-page"><Link className="policy-back" href="/">← Voltar ao site</Link><p className="sf-eyebrow">VIDEIRA VINHOTECA</p><h1>{title}</h1><p className="policy-intro">{intro}</p><div className="policy-content">{sections.map(([h,p])=><section key={h}><h2>{h}</h2><p>{p}</p></section>)}</div><p className="policy-note">Última atualização: outubro de 2026.</p></main>}</StoreShell>;
}
