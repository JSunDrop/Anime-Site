'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function AuthGate({ children }:{ children: any }){
  const [ready,setReady]=useState(false)
  const [authed,setAuthed]=useState(false)
  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>{ setAuthed(!!data.user); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess)=> setAuthed(!!sess?.user))
    return ()=>{ sub.subscription.unsubscribe() }
  },[])
  if(!ready) return <p style={{padding:16}}>Loading…</p>
  if(!authed) return <p style={{padding:16}}>Please <a href="/signin">sign in</a> to continue.</p>
  return children
}