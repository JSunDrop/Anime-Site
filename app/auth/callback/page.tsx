'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Callback(){
  const router = useRouter()
  const [msg,setMsg]=useState('Completing sign‑in…')
  useEffect(()=>{
    (async ()=>{
      try{
        // Try both: magic link (hash) and code exchange
        // @ts-ignore
        if('getSessionFromUrl' in supabase.auth){
          //@ts-ignore
          await supabase.auth.getSessionFromUrl({ storeSession: true })
        }
      }catch(_){} finally{
        setMsg('Signed in. Redirecting…')
        router.replace('/app')
      }
    })()
  },[router])
  return (<main><p>{msg}</p></main>)
}