'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Work = { id:string; title:string; slug:string; kind:'manga'|'animation'; rating:'E'|'T'|'M'|'X'; tags:string[]; cover_url:string|null }
export default function AppHome(){
  const [works,setWorks]=useState<Work[]>([])
  useEffect(()=>{ supabase.from('works').select('id,title,slug,kind,rating,tags,cover_url').then(({data})=> setWorks(data||[])) },[])
  return (<main>
    <h1>Welcome to OtakuHub</h1>
    <p><Link href="/app/explore" className="btn primary">Explore</Link> <Link href="/app/advanced" className="btn">Advanced</Link> <Link href="/app/live" className="btn">Live</Link></p>
    <h3>Featured</h3>
    <div className="grid">
      {works.slice(0,6).map(w => <Link key={w.id} href={`/app/work/${w.slug}`} className="card">
        <b>{w.title}</b> <span style={{opacity:.7}}>({w.kind})</span> <span style={{opacity:.7}}>Rated {w.rating}</span>
        <div>{(w.tags||[]).map(t => <span key={t} className="card" style={{display:'inline-block',padding:'2px 8px',marginRight:6}}>#{t}</span>)}</div>
      </Link>)}
    </div>
  </main>)
}