'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthGate from '@/components/AuthGate'
type Msg = { id:string; by:string|null; text:string; created_at:string }
function Inner(){
  const [msgs,setMsgs]=useState<Msg[]>([])
  const [text,setText]=useState('')
  const boxRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    supabase.from('live_messages').select('*').order('created_at',{ascending:true}).then(({data})=> setMsgs(data||[]))
    const ch = supabase.channel('live-general')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'live_messages' }, (payload:any)=> setMsgs((m)=>[...m, payload.new]))
      .subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  },[])
  useEffect(()=>{ boxRef.current && (boxRef.current.scrollTop = boxRef.current.scrollHeight) },[msgs])
  async function send(){
    if(!text.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('live_messages').insert({ text, by: user?.id || null })
    setText('')
  }
  return (<main>
    <h2>Live Chat — General</h2>
    <div ref={boxRef} style={{maxHeight:420,overflow:'auto',display:'flex',flexDirection:'column',gap:8,border:'1px solid #1f2947',borderRadius:12,padding:12}}>
      {msgs.map(m => <div key={m.id}><b>{m.by ? m.by.slice(0,6) : 'anon'}</b> — {new Date(m.created_at).toLocaleTimeString()}<br/>{m.text}</div>)}
    </div>
    <div style={{marginTop:10}}>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Say something"/>
      <button className="btn primary" onClick={send} style={{marginLeft:8}}>Send</button>
    </div>
  </main>)
}
export default function Page(){ return (<AuthGate><Inner/></AuthGate>) }