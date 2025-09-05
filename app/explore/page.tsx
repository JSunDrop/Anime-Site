'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Explore(){
  const [q,setQ]=useState('')
  const [works,setWorks]=useState<any[]>([])
  useEffect(()=>{ supabase.from('works').select('id,title,slug,kind,rating,tags').then(({data})=> setWorks(data||[])) },[])
  const filtered = works.filter((w:any)=> !q || w.title.toLowerCase().includes(q.toLowerCase()) || (w.tags||[]).join(' ').toLowerCase().includes(q.toLowerCase()))
  return (<main>
    <h2>Explore</h2>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search titles or tags" style={{width:'100%',padding:10,borderRadius:10,border:'1px solid #1f2947',background:'#0b1224',color:'#eaf2ff'}}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12,marginTop:12}}>
      {filtered.map((w:any)=> <Link key={w.id} href={`/work/${w.slug}`} style={{border:'1px solid #1f2947',borderRadius:12,padding:12,display:'block'}}>
        <b>{w.title}</b> <span style={{opacity:.7}}>({w.kind})</span> <span style={{opacity:.7}}>Rated {w.rating}</span>
      </Link>)}
    </div>
  </main>)
}