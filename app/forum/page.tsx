'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Forum(){
  const [threads,setThreads]=useState<any[]>([])
  useEffect(()=>{ supabase.from('forum_threads').select('id,title,created_at,category_id').order('created_at',{ascending:false}).then(({data})=> setThreads(data||[])) },[])
  return (<main>
    <h2>Forum</h2>
    <ul>{threads.map(t => <li key={t.id}><b>{t.title}</b> — {new Date(t.created_at).toLocaleString()}</li>)}</ul>
  </main>)
}