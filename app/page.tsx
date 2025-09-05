import Link from 'next/link'
export default function Home() {
  return (
    <main style={{maxWidth:960, margin:'40px auto', padding:'0 16px'}}>
      <h1>OtakuHub — Next Starter</h1>
      <p>Create. Publish. Collaborate. (Starter)</p>
      <ul>
        <li><Link href="/explore">Explore</Link></li>
        <li><Link href="/studio">Studio</Link></li>
        <li><Link href="/office">Office</Link></li>
        <li><Link href="/profile/demo">Creator Profile</Link></li>
      </ul>
    </main>
  )
}
