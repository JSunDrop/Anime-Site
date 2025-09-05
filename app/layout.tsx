import './globals.css'
import Link from 'next/link'
import { ReactNode } from 'react'
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="en"><body>
    <header style={{position:'sticky',top:0,background:'rgba(12,16,27,.75)',backdropFilter:'blur(8px)',borderBottom:'1px solid #1e2740',padding:'12px 16px',display:'flex',justifyContent:'space-between'}}>
      <div>🎌 <b>OtakuHub</b> <span style={{color:'#66b3ff'}}>GRANDE PRO</span></div>
      <nav style={{display:'flex',gap:12,alignItems:'center'}}>
        <Link href="/">Overview</Link>
        <Link href="/app">App</Link>
        <Link href="/signin">Sign in</Link>
      </nav>
    </header>
    {children}
    <footer style={{padding:16,opacity:.8}}>
      © {new Date().getFullYear()} OtakuHub · <Link href="/app/advanced">Advanced</Link>
    </footer>
  </body></html>)
}