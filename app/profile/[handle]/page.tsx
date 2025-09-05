export default function Profile({ params }:{ params: { handle: string }}){
  return <main style={{maxWidth:960, margin:'40px auto', padding:'0 16px'}}>
    <h2>Creator @{params.handle}</h2>
    <p>TODO: badges/achievements & works.</p>
  </main>
}