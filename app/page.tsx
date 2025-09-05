import Link from 'next/link'
export default function Landing(){
  return (<main>
    <section className="card">
      <h1>The creator‑first platform for anime & manga.</h1>
      <p>Publish series, run a studio workspace, and connect with fans — with smart age protection and a fair <b>1% platform fee</b>.</p>
      <p><Link className="btn primary" href="/app">Enter App</Link> <Link className="btn" href="/signin">Sign in</Link></p>
      <p style={{opacity:.8}}>Age-gated content · Studio Office · Forum & Live Chat · Marketplace</p>
    </section>
  </main>)
}