'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function Work({ params }:{ params:{ slug:string }}){
  const [work,setWork]=useState<any>(null)
  const [parts,setParts]=useState<any[]>([])
  const [comments,setComments]=useState<any[]>([])
  const [blocked,setBlocked]=useState(false)
  const [text,setText]=useState('')
  useEffect(()=>{
    (async ()=>{
      const { data: w } = await supabase.from('works').select('*').eq('slug', params.slug).maybeSingle()
      if(!w){ setBlocked(true); return }
      setWork(w)
      const { data: ps } = await supabase.from('parts').select('*').eq('work_id', w.id).order('index_num',{ascending:true})
      setParts(ps||[])
      const { data: cs } = await supabase.from('comments').select('*').eq('work_id', w.id).order('created_at',{ascending:true})
      setComments(cs||[])
    })()
  },[params.slug])
  async function send(){
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('comments').insert({ work_id: work.id, by: user?.id || null, text })
    setText('')
    const { data: cs } = await supabase.from('comments').select('*').eq('work_id', work.id).order('created_at',{ascending:true})
    setComments(cs||[])
  }
  if(blocked) return <main><h2>Age Restricted</h2><p>You may not meet the age requirement or the work does not exist.</p></main>
  if(!work) return <main><p>Loading…</p></main>
  return (<main>
    <h2>{work.title} <span style={{opacity:.7}}>(Rated {work.rating})</span></h2>
    <p>{work.synopsis}</p>
    <h3>{work.kind==='manga'?'Chapters':'Episodes'}</h3>
    <ul>{parts.map(p => <li key={p.id}>{(work.kind==='manga'?'Ch. ':'Ep. ')}{p.index_num}: {p.title}</li>)}</ul>
    <h3>Comments</h3>
    <div style={{border:'1px solid #1f2947',borderRadius:12,padding:12,marginBottom:8}}>{comments.map(c => <div key={c.id} style={{marginBottom:8}}><b>{c.by?.slice?.(0,6) || 'anon'}</b> — {new Date(c.created_at).toLocaleString()}<br/>{c.text}</div>)}</div>
    <input value={text} onChange={e=>setText(e.target.value)} placeholder="Say something" style={{width:'70%',padding:10,borderRadius:10,border:'1px solid #1f2947',background:'#0b1224',color:'#eaf2ff'}}/>
    <button onClick={send} style={{marginLeft:8}}>Post</button>
  </main>)
}