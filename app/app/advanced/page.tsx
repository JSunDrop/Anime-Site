'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthGate from '@/components/AuthGate'

function Inner(){
  const [dob,setDob]=useState('')
  const [status,setStatus]=useState('')
  useEffect(()=>{ supabase.auth.getUser().then(async ({data})=>{
    if(!data?.user){ setStatus('Sign in to set DOB.'); return }
    const { data: prof } = await supabase.from('profiles').select('dob').eq('id', data.user.id).maybeSingle()
    setDob(prof?.dob || '')
  })},[])
  async function save(){
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ setStatus('Not signed in'); return; }
    const { error } = await supabase.from('profiles').upsert({ id: user.id, dob })
    setStatus(error? error.message : 'Saved!')
  }
  return (<main>
    <h2>Advanced & Recommendations</h2>
    <p>Set your DOB. Server-side age RLS will only return content allowed for your age.</p>
    <input type="date" value={dob} onChange={e=>setDob(e.target.value)} />
    <div><button className="btn primary" onClick={save}>Save</button> <span style={{opacity:.8,marginLeft:10}}>{status}</span></div>
  </main>)
}
export default function Page(){ return (<AuthGate><Inner/></AuthGate>) }