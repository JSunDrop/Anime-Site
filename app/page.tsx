'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Work = { id:string; title:string; slug:string; kind:'manga'|'animation'; rating:'E'|'T'|'M'|'X'; tags:string[]; cover_url:string|null }
export default function Home(){
  const [works,setWorks]=useState<Work[]>([])
  useEffect(()=>{ supabase.from('works').select('id,title,slug,kind,rating,tags,cover_url').then(({data})=> setWorks(data||[])) },[])
  return (<main>
    <h1>OtakuHub — Enhanced</h1>
    <p>Create. Publish. Collaborate. Age-gated content, forum, live chat, comments.</p>
    <p><Link href="/explore">Explore</Link> • <Link href="/advanced">Advanced</Link> • <Link href="/forum">Forum</Link> • <Link href="/live">Live</Link></p>
    <h3>Featured</h3>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
      {works.slice(0,6).map(w => <Link key={w.id} href={`/work/${w.slug}`} style={{border:'1px solid #1f2947',borderRadius:12,padding:12,display:'block'}}>
        <b>{w.title}</b> <span style={{opacity:.7}}>({w.kind})</span> <span style={{opacity:.7}}>Rated {w.rating}</span>
        <div>{(w.tags||[]).map(t => <span key={t} style={{border:'1px solid #294a7f',borderRadius:999,padding:'2px 8px',marginRight:6,display:'inline-block'}}>#{t}</span>)}</div>
      </Link>)}
    </div>
  </main>)
}