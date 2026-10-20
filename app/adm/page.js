'use client';
import { useEffect, useMemo, useState } from 'react';

import {adminCall,signInAdmin} from './adminApi';
const TABS=[
  ['products','Produtos'],
  ['categories','Categorias'],
  ['wineries','Bodegas'],
  ['grapes','Uvas'],
];

const call=adminCall;

function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result||''));
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

function Toggle({label,checked,onChange}){
  return <label className="adm-toggle"><input type="checkbox" checked={!!checked} onChange={e=>onChange(e.target.checked)}/><span/>{label}</label>
}

function ProductForm({value,onChange}){
  const set=(k,v)=>onChange({...value,[k]:v});
  return <div className="adm-form-grid">
    <label>Nome<input value={value.name||''} onChange={e=>set('name',e.target.value)}/></label>
    <label>Bodega<input value={value.winery||''} onChange={e=>set('winery',e.target.value)}/></label>
    <label>País<input value={value.country||''} onChange={e=>set('country',e.target.value)}/></label>
    <label>Uva<input value={value.grape||''} onChange={e=>set('grape',e.target.value)}/></label>
    <label>Categoria / tipo<input value={value.type||''} onChange={e=>set('type',e.target.value)}/></label>
    <label>Preço<input type="number" min="0" step="0.01" value={value.price??0} onChange={e=>set('price',Number(e.target.value||0))}/></label>
    <label>Preço no Pix<input type="number" min="0" step="0.01" value={value.pix_price??''} onChange={e=>set('pix_price',e.target.value===''?null:Number(e.target.value))}/></label>
    <label>Preço no cartão<input type="number" min="0" step="0.01" value={value.card_price??''} onChange={e=>set('card_price',e.target.value===''?null:Number(e.target.value))}/></label>
    <label className="adm-span-2">Descrição<textarea rows="5" value={value.tasting_notes||''} onChange={e=>set('tasting_notes',e.target.value)}/></label>
    <label className="adm-span-2">Imagem
      <input type="file" accept="image/*" onChange={async e=>{const f=e.target.files?.[0];if(f)set('image_url',await fileToDataUrl(f))}}/>
      {value.image_url&&<img className="adm-image-preview" src={value.image_url} alt="Prévia do rótulo"/>}
    </label>
    <div className="adm-checks adm-span-2">
      <Toggle label="Ativo no site" checked={value.active!==false} onChange={v=>set('active',v)}/>
      <Toggle label="Destaque" checked={value.featured} onChange={v=>set('featured',v)}/>
    </div>
  </div>
}

function SimpleForm({entity,value,onChange}){
  const set=(k,v)=>onChange({...value,[k]:v});
  return <div className="adm-form-grid">
    <label className="adm-span-2">Nome<input value={value.name||''} onChange={e=>set('name',e.target.value)}/></label>
    {entity==='wineries'&&<label className="adm-span-2">Logo da bodega
      <input type="file" accept="image/*" onChange={async e=>{const f=e.target.files?.[0];if(f)set('logo_url',await fileToDataUrl(f))}}/>
      {value.logo_url&&<img className="adm-logo-preview" src={value.logo_url} alt="Logo da bodega"/>}
    </label>}
    <div className="adm-checks adm-span-2"><Toggle label="Ativo" checked={value.active!==false} onChange={v=>set('active',v)}/></div>
  </div>
}

export default function AdminPage(){
  const [token,setToken]=useState('');
  const [login,setLogin]=useState({username:'',password:''});
  const [loginError,setLoginError]=useState('');
  const [tab,setTab]=useState('products');
  const [items,setItems]=useState([]);
  const [count,setCount]=useState(0);
  const [q,setQ]=useState('');
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(false);
  const [editing,setEditing]=useState(null);
  const [saving,setSaving]=useState(false);
  const pageSize=40;

  useEffect(()=>{const t=sessionStorage.getItem('videira-admin-token')||'';if(t)setToken(t)},[]);

  const load=async()=>{
    if(!token)return;
    setLoading(true);
    try{
      const d=await call({action:'list',entity:tab,q,page,pageSize});
      setItems(d.items||[]);setCount(d.count||0);
    }catch(e){
      if(String(e.message).includes('unauthorized')){sessionStorage.removeItem('videira-admin-token');setToken('')}
    }finally{setLoading(false)}
  };
  useEffect(()=>{setPage(1)},[tab,q]);
  useEffect(()=>{load()},[token,tab,q,page]);

  const doLogin=async e=>{
    e.preventDefault();setLoginError('');
    try{
      const d=await signInAdmin(login.username,login.password);sessionStorage.setItem('videira-admin-token',d.token);setToken(d.token);setLogin({username:'',password:''});
    }catch(e){setLoginError(e.message)}
  };

  const save=async()=>{
    setSaving(true);
    try{await call({action:'save',entity:tab,data:editing});setEditing(null);await load()}
    catch(e){alert(e.message)}
    finally{setSaving(false)}
  };
  const del=async item=>{
    if(!confirm(`Excluir "${item.name}"? Essa ação não pode ser desfeita.`))return;
    try{await call({action:'delete',entity:tab,id:item.id});await load()}catch(e){alert(e.message)}
  };
  const logout=async()=>{try{await call({action:'logout'})}catch{}sessionStorage.removeItem('videira-admin-token');setToken('')};
  const title=TABS.find(x=>x[0]===tab)?.[1]||'Painel';
  const pages=Math.max(1,Math.ceil(count/pageSize));

  if(!token)return <main className="adm-login-page"><form className="adm-login-card" onSubmit={doLogin}>
    <div className="adm-brand">Videira <span>ADM</span></div>
    <h1>Painel administrativo</h1>
    <p>Gerencie o catálogo da Videira Vinhoteca.</p>
    <label>Usuário<input autoComplete="username" value={login.username} onChange={e=>setLogin({...login,username:e.target.value})}/></label>
    <label>Senha<input type="password" autoComplete="current-password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/></label>
    {loginError&&<div className="adm-error">{loginError}</div>}
    <button type="submit">Entrar</button>
  </form></main>;

  return <main className="adm-page">
    <aside className="adm-sidebar">
      <div className="adm-brand">Videira <span>ADM</span></div>
      <nav>{TABS.map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setQ('');setEditing(null)}}>{label}</button>)}</nav>
      <a href="/" target="_blank">Abrir site ↗</a>
      <button className="adm-logout" onClick={logout}>Sair</button>
    </aside>

    <section className="adm-content">
      <header className="adm-top">
        <div><p>CATÁLOGO</p><h1>{title}</h1></div>
        <button className="adm-new" onClick={()=>setEditing(tab==='products'?{name:'',price:0,active:true,in_stock:true,new_arrival:false,featured:false}:{name:'',active:true})}>+ Novo</button>
      </header>

      <div className="adm-toolbar">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Pesquisar em ${title.toLowerCase()}...`}/>
        <span>{count} registro{count===1?'':'s'}</span>
      </div>

      <div className="adm-table-wrap">
        {loading?<div className="adm-loading">Carregando...</div>:
        <table className="adm-table">
          <thead><tr>{tab==='products'?<><th>Produto</th><th>Bodega</th><th>País</th><th>Uva</th><th>Status</th><th>Preço</th></>:<><th>Nome</th>{tab==='wineries'&&<th>Logo</th>}<th>Status</th></>}<th/></tr></thead>
          <tbody>{items.map(item=><tr key={item.id}>
            {tab==='products'?<>
              <td><strong>{item.name}</strong><small>{item.id}</small></td>
              <td>{item.winery||'—'}</td><td>{item.country||'—'}</td><td>{item.grape||'—'}</td>
              <td><span className={item.active!==false?'adm-stock ok':'adm-stock out'}>{item.active!==false?'Ativo no site':'Inativo'}</span></td>
              <td>R$ {Number(item.price||0).toFixed(2).replace('.',',')}</td>
            </>:<>
              <td><strong>{item.name}</strong></td>
              {tab==='wineries'&&<td>{item.logo_url?<img className="adm-mini-logo" src={item.logo_url} alt=""/>:'—'}</td>}
              <td><span className={item.active!==false?'adm-stock ok':'adm-stock out'}>{item.active!==false?'Ativo':'Inativo'}</span></td>
            </>}
            <td className="adm-row-actions"><button onClick={()=>setEditing({...item})}>Editar</button><button className="danger" onClick={()=>del(item)}>Excluir</button></td>
          </tr>)}</tbody>
        </table>}
      </div>

      <div className="adm-pager"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Anterior</button><span>Página {page} de {pages}</span><button disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Próxima →</button></div>
    </section>

    {editing&&<div className="adm-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null)}}>
      <section className="adm-editor">
        <header><div><p>{editing.id?'EDITAR':'NOVO'}</p><h2>{tab==='products'?(editing.name||'Produto'):(editing.name||title)}</h2></div><button onClick={()=>setEditing(null)}>×</button></header>
        <div className="adm-editor-body">{tab==='products'?<ProductForm value={editing} onChange={setEditing}/>:<SimpleForm entity={tab} value={editing} onChange={setEditing}/>}</div>
        <footer><button className="secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="primary" disabled={saving} onClick={save}>{saving?'Salvando...':'Salvar alterações'}</button></footer>
      </section>
    </div>}
  </main>;
}
