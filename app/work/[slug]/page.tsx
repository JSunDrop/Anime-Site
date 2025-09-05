export default function Work({ params }:{ params: { slug: string }}){
  return <main style={{maxWidth:1100, margin:'40px auto', padding:'0 16px'}}>
    <h2>Work: {params.slug}</h2>
    <p>TODO: reader/viewer with "resume/start", sidebar episode list, and age gate.</p>
  </main>
}