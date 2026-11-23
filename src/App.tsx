import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowRight, Instagram, MessageCircle, Package, Pencil, Trash2, LogOut, LockKeyhole } from 'lucide-react'
import { hasSupabase, supabase } from './supabase'

type Product = { id: string; name: string; category: string; description: string; price: number; stock: number; image_url: string | null; featured: boolean }
const demo: Product[] = [
  { id:'demo-1', name:'Kit 2 Controles sem fio para PS4 com LED', category:'Games', description:'Kit com dois controles sem fio.', price:290, stock:4, image_url:null, featured:true },
  { id:'demo-2', name:'Relógio dourado clássico', category:'Acessórios', description:'Design elegante para todas as ocasiões.', price:189.90, stock:3, image_url:null, featured:false },
  { id:'demo-3', name:'Bolsa premium preta', category:'Moda', description:'Bolsa sofisticada para o dia a dia.', price:219.90, stock:0, image_url:null, featured:false }
]
const money = (n:number) => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const whatsapp = (p:Product) => {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || ''
  const msg = encodeURIComponent(`Olá! Tenho interesse no produto: ${p.name} — ${money(p.price)}.`)
  return `https://wa.me/${number}?text=${msg}`
}
export default function App() {
  const [products,setProducts] = useState<Product[]>(demo)
  const [query,setQuery] = useState('')
  const [category,setCategory] = useState('Todas')
  const [admin,setAdmin] = useState(false)
  const [session,setSession] = useState(false)
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [editing,setEditing] = useState<Product|null>(null)
  const [form,setForm] = useState({name:'',category:'Acessórios',description:'',price:'',stock:'',image_url:'',featured:false})
  const [busy,setBusy] = useState(false)
  const categories = useMemo(()=>['Todas',...Array.from(new Set(products.map(p=>p.category)))],[products])
  const visible = products.filter(p => (category==='Todas'||p.category===category) && `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()))
  const featured = products.find(p=>p.featured) || products[0]
  async function load() {
    if (!supabase) return
    const {data,error} = await supabase.from('products').select('*').order('created_at',{ascending:false})
    if (!error && data) setProducts(data as Product[])
  }
  useEffect(()=>{ load() },[])
  useEffect(()=>{
    if (!supabase) return
    supabase.auth.getSession().then(({data})=>setSession(Boolean(data.session)))
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,s)=>setSession(Boolean(s)))
    return ()=>subscription.unsubscribe()
  },[])
  async function signIn(e:React.FormEvent) {
    e.preventDefault()
    if (!supabase) return alert('Configure o Supabase para ativar o acesso administrativo.')
    const {error} = await supabase.auth.signInWithPassword({email,password})
    if (error) alert(error.message)
  }
  async function save(e:React.FormEvent) {
    e.preventDefault()
    if (!supabase || !session) return
    setBusy(true)
    const payload = {...form,price:Number(form.price),stock:Number(form.stock),image_url:form.image_url||null}
    const result = editing ? await supabase.from('products').update(payload).eq('id',editing.id) : await supabase.from('products').insert(payload)
    setBusy(false)
    if (result.error) return alert(result.error.message)
    setEditing(null); setForm({name:'',category:'Acessórios',description:'',price:'',stock:'',image_url:'',featured:false}); load()
  }
  async function remove(id:string) {
    if (!supabase || !confirm('Excluir este produto?')) return
    const {error}=await supabase.from('products').delete().eq('id',id)
    if(error) alert(error.message); else load()
  }
  function edit(p:Product) {
    setEditing(p); setForm({name:p.name,category:p.category,description:p.description||'',price:String(p.price),stock:String(p.stock),image_url:p.image_url||'',featured:p.featured})
  }
  return <div>
    <header className="topbar"><a className="brand" href="#"><span className="monogram">F</span><span>Felipe<small>IMPORTS</small></span></a>
      <nav><a href="#inicio">Início</a><a href="#catalogo">Catálogo</a><a href="#categorias">Categorias</a><a href="#sobre">A loja</a></nav>
      <div className="top-actions"><label className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar peças"/></label><button className="outline small" onClick={()=>setAdmin(!admin)}>{admin?'VOLTAR À LOJA':'PAINEL'}</button></div>
    </header>
    {admin ? <main className="admin-wrap">
      <div className="admin-head"><div><span className="eyebrow">GESTÃO DA LOJA</span><h1>Painel administrativo</h1><p>Gerencie produtos, preços e disponibilidade da Felipe Imports.</p></div>{session&&<button className="outline" onClick={()=>supabase?.auth.signOut()}><LogOut size={15}/> Sair</button>}</div>
      {!session ? <form className="login panel" onSubmit={signIn}><LockKeyhole/><h2>Acesso do administrador</h2><input type="email" required placeholder="Seu e-mail" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" required placeholder="Sua senha" value={password} onChange={e=>setPassword(e.target.value)}/><button className="gold">Entrar no painel</button>{!hasSupabase&&<p className="hint">O painel será ativado depois de conectar o Supabase.</p>}</form> :
      <div className="admin-grid"><section className="panel"><h2>{editing?'Editar produto':'Adicionar produto'}</h2><form className="product-form" onSubmit={save}>
        <input required placeholder="Nome do produto" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input required placeholder="Categoria" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
        <textarea placeholder="Descrição" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <div className="two"><input required type="number" min="0" step="0.01" placeholder="Preço (R$)" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/><input required type="number" min="0" step="1" placeholder="Estoque" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></div>
        <input placeholder="URL da imagem do produto" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/>
        <label className="check"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Destacar na página inicial</label>
        <button className="gold" disabled={busy}>{busy?'Salvando...':editing?'Salvar alterações':'Cadastrar produto'}</button>
        {editing&&<button type="button" className="outline" onClick={()=>setEditing(null)}>Cancelar edição</button>}
      </form></section><section className="panel"><h2>Produtos cadastrados</h2>{products.map(p=><div className="admin-product" key={p.id}><div><b>{p.name}</b><small>{money(p.price)} · Estoque: {p.stock} · {p.stock>0?'Disponível':'Esgotado'}</small></div><button className="icon-btn" onClick={()=>edit(p)}><Pencil size={16}/></button><button className="icon-btn danger" onClick={()=>remove(p.id)}><Trash2 size={16}/></button></div>)}</section></div>}
    </main> : <>
      <section className="hero" id="inicio"><div className="hero-content"><span className="eyebrow">CURADORIA DE IMPORTADOS</span><h1>As melhores<br/>ofertas estão<br/>aqui.</h1><p>Qualidade, praticidade e ofertas especiais em um só lugar. Peças selecionadas em casa, tecnologia e acessórios — com disponibilidade conferida e compra direta na loja parceira.</p><div className="hero-buttons"><a className="gold" href="#catalogo">Conferir ofertas <ArrowRight size={16}/></a><a className="outline light" href="#catalogo">Ver disponíveis</a></div>
      {featured&&<a className="featured" href="#catalogo"><span className="featured-thumb">{featured.image_url?<img src={featured.image_url}/>:<Package/>}</span><span><small>EM DESTAQUE</small><b>{featured.name}</b><strong>{money(featured.price)} <i>• {featured.stock>0?'DISPONÍVEL':'ESGOTADO'}</i></strong></span></a>}</div></section>
      <section className="catalog section" id="catalogo"><div className="section-title"><div><span className="eyebrow">SELEÇÃO ESPECIAL</span><h2>Catálogo</h2></div><span className="muted">{visible.length} produtos</span></div>
        <div className="chips" id="categorias">{categories.map(c=><button className={category===c?'chip active':'chip'} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div>
        <div className="products">{visible.map(p=><article className="product" key={p.id}><div className="product-image">{p.image_url?<img src={p.image_url} alt={p.name}/>:<div className="placeholder"><Package size={34}/><span>FELIPE IMPORTS</span></div>}{p.stock<=0&&<span className="sold">ESGOTADO</span>}</div><div className="product-info"><small>{p.category}</small><h3>{p.name}</h3><p>{p.description}</p><div className="product-bottom"><b>{money(p.price)}</b><span className={p.stock>0?'available':'unavailable'}>{p.stock>0?'DISPONÍVEL':'ESGOTADO'}</span></div>{p.stock>0?<a className="buy" href={whatsapp(p)} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Consultar pelo WhatsApp</a>:<button className="buy disabled" disabled>Indisponível no momento</button>}</div></article>)}</div>
      </section>
      <section className="about" id="sobre"><span className="eyebrow">FELIPE IMPORTS</span><h2>Escolhas especiais.<br/>Compra com confiança.</h2><p>Uma seleção de produtos importados, com atendimento direto e informações claras sobre disponibilidade.</p><a href="#catalogo" className="text-link">Explorar catálogo <ArrowRight size={15}/></a></section>
    </>}
    <footer><a className="brand" href="#"><span className="monogram">F</span><span>Felipe<small>IMPORTS</small></span></a><span>© {new Date().getFullYear()} Felipe Imports. Todos os direitos reservados.</span><a href="#sobre"><Instagram size={17}/></a></footer>
  </div>
}