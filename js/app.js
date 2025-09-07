// Minimal carousel controls + horizontal scroller arrows
const stage = document.querySelector('.feat-stage');
const prev = document.getElementById('featPrev');
const next = document.getElementById('featNext');
let idx = 0;

const featured = [
  {t:'Railgun Waltz', by:'Mako Reactor', tags:['#action','#fantasy','#steampunk'], img:'assets/no-video.png'},
  {t:'Azure Lullaby', by:'Mako Reactor', tags:['#drama','#music','#fantasy'], img:'assets/no-manga.png'},
  {t:'Spark Runner', by:'OniWorks', tags:['#sci-fi','#action','#neon'], img:'assets/no-video.png'}
];

function render(i){
  const f = featured[i % featured.length];
  stage.innerHTML = `
  <div class="feat-card">
    <img src="${f.img}" alt="cover"/>
    <div class="meta">
      <div class="t">${f.t}</div>
      <div class="by">by ${f.by}</div>
      <div class="tags">${f.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
    </div>
  </div>`;
}
prev?.addEventListener('click', ()=>{ idx = (idx-1+featured.length)%featured.length; render(idx); });
next?.addEventListener('click', ()=>{ idx = (idx+1)%featured.length; render(idx); });
render(idx);

// Continue Reading scroller arrows
document.querySelectorAll('.scrollLeft').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    btn.closest('.panel').querySelector('.hscroll').scrollBy({left:-320, behavior:'smooth'});
  });
});
document.querySelectorAll('.scrollRight').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    btn.closest('.panel').querySelector('.hscroll').scrollBy({left:320, behavior:'smooth'});
  });
});
