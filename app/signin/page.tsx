'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function SignIn(){
  const router = useRouter()
  const [email,setEmail]=useState('')
  const [code,setCode]=useState('')
  const [msg,setMsg]=useState('')
  async function sendLink(){
    setMsg('Sending magic link…')
    const { error } = await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: `${location.origin}/auth/callback` } })
    setMsg(error? error.message : 'Check your email for the link.')
  }
  async function verifyCode(){
    setMsg('Verifying code…')
    // OTP fallback; in Supabase v2 this is type: 'email' for code-based OTP.
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' as any })
    setMsg(error? error.message : 'Signed in!')
    if(!error){ router.replace('/app') }
  }
  return (<main>
    <h1>Sign in</h1>
    <div className="card">
      <label>Email<br/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label>
      <div style={{marginTop:8}}>
        <button className="btn primary" onClick={sendLink}>Send magic link</button>
      </div>
      <hr style={{opacity:.2,margin:'14px 0'}}/>
      <div>Or enter the 6‑digit code from the email:</div>
      <input value={code} onChange={e=>setCode(e.target.value)} placeholder="123456" style={{marginTop:6}}/>
      <div style={{marginTop:8}}>
        <button className="btn" onClick={verifyCode}>Verify code</button>
      </div>
      <div style={{opacity:.8,marginTop:8}}>{msg}</div>
    </div>
  </main>)
}