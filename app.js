
(() => {
  const ASSETS = window.__ASSETS__ || {};
  // set bg image on a CSS var so CSS can read it
  document.documentElement.style.setProperty('--bg-url', ASSETS.background);
  const _bg = document.getElementById('bg-layer');
  if (_bg) _bg.style.backgroundImage = `url(${ASSETS.background})`;

  const el = (sel, ctx=document) => ctx.querySelector(sel);
  const app = el('#app');

  // Nav handling
  el('#nav').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-route]');
    if(!btn) return;
    location.hash = btn.dataset.route;
  });

  function setActive(route){
    document.querySelectorAll('#nav .pill').forEach(p => p.classList.remove('active'));
    const btn = document.querySelector(`#nav [data-route="${route}"]`);
    if(btn) btn.classList.add('active');
  }

  // Views
  function viewHome(){
    setActive('#/home');
    app.innerHTML = `
      <section class="hero grid card panel">
        <div>
          <h1>Anime & Manga, by the community, for the community</h1>
          <p class="lead">
            <strong>Welcome to the Future of Anime & Manga.</strong> Read. Create. Earn. <em>Without the paywalls.</em><br/>
            Dive into a world where anime and manga thrive — free from subscriptions, tokens, and money grabs.
            Whether you’re a fan looking to discover your next obsession or a creator ready to build your own studio, this is your home.
            <br/><br/>
            <strong>For Fans:</strong> Browse, shop, and support your favorite stories directly. No hidden fees, no hoops — just pure content.
            <br/>
            <strong>For Creators:</strong> Launch your studio, gather a team, release your works, and set your own subscriptions if you choose.
            You keep <strong>99%</strong> — we only take <strong>1%</strong> to keep the lights on.
            <br/><br/>
            No middlemen. No nonsense. Just anime, manga, and the community that loves them.
          </p>
          <div class="actions">
            <button class="btn" data-route="#/publish">Start Publishing</button>
            <button class="btn ghost" data-route="#/explore">Explore Works</button>
          </div>
          <div class="badges"><span class="tag">Age protection</span><span class="tag">Creator-first</span><span class="tag">1% fee</span></div>
        </div>
        <div class="card panel">
          <h3 style="margin:0 0 10px">Featured</h3>
          <div class="carousel" id="featured">
  <div class="carousel-viewport"></div>
  <div class="nav">
    <button class="icon-btn" data-dir="-1">←</button>
    <button class="icon-btn" data-dir="1">→</button>
    <button class="pill" data-route="#/explore">See all →</button>
  </div>
</div>
          </div>
        </div>
      </section>

      
<section class="card panel" style="margin-top:20px">
  <h3 style="margin:0 0 12px">Continue Reading / Watching</h3>
  <div class="hlist-container">
    <div class="hlist" id="continueList">
      ${window.DB.catalog.map(tile).join('')}
    </div>
    <div class="hlist-nav left"><button id="scrollLeft">←</button></div>
    <div class="hlist-nav right"><button id="scrollRight">→</button></div>
  </div>
</section>


      <section class="card panel" style="margin-top:20px">
        <h3 style="margin:0 0 12px">Browse by Tag</h3>
        <div class="scroller" id="tags">${collectTags().map(t => `<span class='tag'>#${t}</span>`).join('')}</div>
      </section>
    `;

    // wire buttons
    app.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',e=>{
      location.hash = b.dataset.route;
    }));

    // build featured
    const vp = el('#featured .carousel-viewport', app);
    const slides = window.DB.featured.map(w => `
      <div class="slide">
        <div class="cover">
          <img alt="cover" src="${coverFor(w)}" onerror="this.src='${ASSETS.placeholderManga}'"/>
          <div class="meta">
            <div class="title">${w.title}</div>
            <div class="by">by ${w.creator}</div>
            <div class="badges">${w.tags.map(t=>`<span class='tag'>#${t}</span>`).join('')}</div>
          </div>
        </div>
      </div>`);
    vp.innerHTML = slides.join('');

// wire Continue scroller arrows
    const cont = el('#continue .viewport', app);
    const contNav = el('#continue .nav', app);
    if (cont && contNav){
      contNav.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-dir]'); if(!btn) return;
        const dir = parseInt(btn.dataset.dir,10);
        cont.scrollBy({ left: dir * 260, behavior: 'smooth' });
      });
    }
    let idx = 0, N = slides.length, timer;
    const update = ()=>{ vp.style.transform = `translateX(-${idx*100}%)`; };
    const start = ()=>{ stop(); timer = setInterval(()=>{ idx=(idx+1)%N; update(); }, 4500); };
    const stop = ()=>{ if(timer) clearInterval(timer); };
    el('#featured [data-dir="-1"]', app).onclick = ()=>{ idx=(idx-1+N)%N; update(); start(); };
    el('#featured [data-dir="1"]', app).onclick = ()=>{ idx=(idx+1)%N; update(); start(); };
    start();
  }

  function tile(w){
    return `
    <article class="tile">
      <img src="${coverFor(w)}" onerror="this.src='${w.kind==='animation'? ASSETS.placeholderVideo : ASSETS.placeholderManga}'" alt="cover"/>
      <div class="tile-body">
        <h4>${w.title}</h4>
        <div class="by" style="color:#9bb0d0">by ${w.creator}</div>
        <div class="badges">${w.tags.slice(0,3).map(t=>`<span class='tag'>#${t}</span>`).join('')}</div>
      </div>
    </article>`;
  }

  function viewExplore(){
    setActive('#/explore');
    const typeTabs = ['All','Manga','Animation'];
    app.innerHTML = `
      <section class="card panel">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px">
          <h2 style="margin:0">Explore</h2>
          <div class="tabs" id="filterTabs" style="padding:0">
            ${typeTabs.map((t,i)=>`<button class="pill ${i===0?'active':''}" data-kind="${t.toLowerCase()}">${t}</button>`).join('')}
          </div>
        </div>
        <div class="grid cols-3" id="expGrid" style="margin-top:14px"></div>
      </section>
    `;
    const grid = el('#expGrid', app);
    const render = (kind) =>{
      let list = window.DB.catalog;
      if(kind==='manga') list = list.filter(w=>w.kind==='manga');
      if(kind==='animation') list = list.filter(w=>w.kind==='animation');
      grid.innerHTML = list.map(tile).join('');
    };
    app.querySelectorAll('#filterTabs .pill').forEach(b=>b.onclick=()=>{
      app.querySelectorAll('#filterTabs .pill').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); render(b.dataset.kind);
    });
    render('all');
  }

  function stub(title){
    return `<section class="card panel"><h2 style="margin:0 0 6px">${title}</h2><p class="lead">Coming soon — layout is ready to flesh out.</p></section>`;
  }

  const routes = {
    '#/home': viewHome,
    '#/explore': viewExplore,
    '#/leaderboard': () => { setActive('#/leaderboard'); app.innerHTML = stub('Leaderboard'); },
    '#/shop': () => { setActive('#/shop'); app.innerHTML = stub('Shop'); },
    '#/studio': () => { setActive('#/studio'); app.innerHTML = stub('Studio'); },
    '#/forum': () => { setActive('#/forum'); app.innerHTML = stub('Forum'); },
    '#/live': () => { setActive('#/live'); app.innerHTML = stub('Live'); },
    '#/discover': () => { setActive('#/discover'); app.innerHTML = stub('Discover'); },
    '#/qa': () => { setActive('#/qa'); app.innerHTML = stub('Q & A'); },
    '#/publish': () => { setActive('#/publish'); app.innerHTML = stub('Publish'); },
  };

  function coverFor(w){
    if(w.cover) return w.cover;
    return w.kind === 'animation' ? ASSETS.placeholderVideo : ASSETS.placeholderManga;
  }

  function collectTags(){
    const s = new Set();
    window.DB.catalog.forEach(w=>w.tags.forEach(t=>s.add(t)));
    return [...s].sort();
  }

  function router(){
    const h = location.hash || '#/home';
    (routes[h] || routes['#/home'])();
  }
  window.addEventListener('hashchange', router);
  router();
})();
