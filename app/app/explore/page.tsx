'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function Explore(){
  const [q,setQ]=useState('')
  const [works,setWorks]=useState<any[]>([])
  useEffect(()=>{ supabase.from('works').select('id,title,slug,kind,rating,tags').then(({data})=> setWorks(data||[])) },[])
  const filtered = works.filter((w:any)=> !q || w.title.toLowerCase().includes(q.toLowerCase()) || (w.tags||[]).join(' ').toLowerCase().includes(q.toLowerCase()))
  return (<main>
    <h2>Explore</h2>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search titles or tags"/>
    <div className="grid" style={{marginTop:12}}>
      {filtered.map((w:any)=> <Link key={w.id} href={`/app/work/${w.slug}`} className="card">
        <b>{w.title}</b> <span style={{opacity:.7}}>({w.kind})</span> <span style={{opacity:.7}}>Rated {w.rating}</span>
      </Link>)}
    </div>
  </main>)
}