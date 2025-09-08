/* ─────────────────────────────────────────────────────────────
   DOJINOVA • APP JS
   - Shared top utilities header
   - Left sidebar (logo + vertical tabs)
   - Featured (2 at a time, stacked)
   - Saved list (localStorage)
   - Simple login demo (localStorage)
   ───────────────────────────────────────────────────────────── */

/* ============================================================
   1) TOP BAR (utilities only: Search / Saved / Log In / Menu)
   ============================================================ */
function buildHeader(){
  return `
  <div class="wrap header-bar">
    <nav class="nav-right">
      <button class="icon-btn" id="searchBtn" aria-label="Search" title="Search">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.71.71l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z"/>
        </svg>
      </button>
      <span class="nav-divider" aria-hidden="true"></span>
      <a class="nav-link" data-page="saved.html" href="saved.html">Saved</a>
      <a class="nav-link" data-page="login.html" id="loginLink" href="login.html">Log In</a>
      <button class="icon-btn" id="menuBtn" aria-label="Menu" title="Menu">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>
        </svg>
      </button>
    </nav>

    <div class="search-popover" id="searchBox">
      <input type="search" placeholder="Search works…" aria-label="Search works">
    </div>
  </div>`;
}

function injectHeader(){
  const hdr = document.querySelector('.site-header');
  if(!hdr) return;
  hdr.innerHTML = buildHeader();

  // Search popover
  const btn = document.getElementById('searchBtn');
  const box = document.getElementById('searchBox');
  if(btn && box){
    btn.addEventListener('click', ()=>{
      box.classList.toggle('open');
      if(box.classList.contains('open')) box.querySelector('input')?.focus();
    });
    document.addEventListener('click', (e)=>{
      if(!box.contains(e.target) && !btn.contains(e.target)) box.classList.remove('open');
    });
  }

  // Mobile menu toggles sidebar
  const menuBtn = document.getElementById('menuBtn');
  menuBtn?.addEventListener('click', ()=>{
    document.body.classList.toggle('menu-open');
  });
}

/* ============================================================
   2) LEFT SIDEBAR (logo + vertical nav)
   ============================================================ */
function buildSidebar(){
  return `
  <aside class="sidebar" id="sidebar">
    <a class="side-brand" href="index.html" aria-label="Dojinova home">
      <img src="assets/dojinova-logo.png" alt="Dojinova">
    </a>

    <nav class="side-nav">
      <a class="side-link" data-page="index.html" href="index.html">Home</a>
      <a class="side-link" data-page="explore.html" href="explore.html">Explore</a>
      <a class="side-link" data-page="shop.html" href="shop.html">Shop</a>
      <a class="side-link" data-page="leaderboard.html" href="leaderboard.html">Leaderboard</a>

      <div class="side-group">
        <button class="side-link side-toggle" data-page="studio.html" aria-expanded="false">Studio</button>
        <div class="side-sub">
          <a href="publish.html">Publish</a>
          <a href="my-projects.html">My Projects</a>
          <a href="team-settings.html">Team Settings</a>
        </div>
      </div>

      <a class="side-link" data-page="forum.html" href="forum.html">Forum</a>
      <a class="side-link" data-page="live.html" href="live.html">Live</a>
      <a class="side-link" data-page="discover.html" href="discover.html">Discover</a>
      <a class="side-link" data-page="qa.html" href="qa.html">Q&amp;A</a>
    </nav>
  </aside>`;
}

function injectSidebar(){
  document.body.classList.add('with-sidebar');
  document.body.insertAdjacentHTML('afterbegin', buildSidebar());

  // Active link by file name
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.sidebar .side-link[data-page]').forEach(a=>{
    if(a.dataset.page.toLowerCase() === file){ a.classList.add('active'); }
  });

  // Studio submenu
  const toggle = document.querySelector('.side-toggle');
  const sub = document.querySelector('.side-sub');
  if(toggle && sub){
    toggle.addEventListener('click', ()=>{
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      sub.classList.toggle('open', !open);
    });
  }

  // Close when clicking outside (mobile)
  document.addEventListener('click', (e)=>{
    if(!document.body.classList.contains('menu-open')) return;
    const sb = document.getElementById('sidebar');
    const mb = document.getElementById('menuBtn');
    if(sb && !sb.contains(e.target) && mb && !mb.contains(e.target)){
      document.body.classList.remove('menu-open');
    }
  });
}

/* ============================================================
   3) FEATURED (2 cards at a time, stacked)
   ============================================================ */
const featured = [
  {t:'Railgun Waltz', by:'Mako Reactor', tags:['#action','#fantasy','#steampunk'], img:'assets/no-manga.png'},
  {t:'Azure Lullaby', by:'Mako Reactor', tags:['#drama','#music','#fantasy'], img:'assets/no-video.png'},
  {t:'Spark Runner', by:'OniWorks',     tags:['#sci-fi','#action','#neon'],     img:'assets/no-video.png'},
  {t:'Blade of Dawn', by:'OniWorks',    tags:['#shounen','#adventure','#fantasy'], img:'assets/no-manga.png'}
];
let featIdx = 0;

const cardHtml = f => `
  <div class="feat-card">
    <img src="${f.img}" alt="cover">
    <div class="meta">
      <div class="t">${f.t}</div>
      <div class="by">by ${f.by}</div>
      <div class="tags">${f.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      <div class="actions-row"><button class="pill sm save-btn">Save</button></div>
    </div>
  </div>`;

function renderFeatured(i){
  const stage = document.querySelector('.feat-stage');
  if(!stage) return;
  const a = featured[i % featured.length];
  const b = featured[(i+1) % featured.length];
  stage.innerHTML = cardHtml(a) + cardHtml(b);

  // wire Save buttons
  stage.querySelectorAll('.feat-card').forEach(card=>{
    const t = card.querySelector('.t')?.textContent?.trim() || 'Featured';
    const by = card.querySelector('.by')?.textContent?.replace(/^by\s*/i,'').trim() || 'Unknown';
    const img = card.querySelector('img')?.getAttribute('src') || 'assets/no-manga.png';
    const btn = card.querySelector('.save-btn');
    btn.addEventListener('click', ()=>{
      addSaved({t, by, img});
      btn.textContent = 'Saved ✓';
      setTimeout(()=>btn.textContent='Save', 1000);
    });
  });
}
function wireFeaturedArrows(){
  const prev = document.getElementById('featPrev');
  const next = document.getElementById('featNext');
  prev?.addEventListener('click', ()=>{ featIdx = (featIdx - 2 + featured.length) % featured.length; renderFeatured(featIdx); });
  next?.addEventListener('click', ()=>{ featIdx = (featIdx + 2) % featured.length; renderFeatured(featIdx); });
}

/* ============================================================
   4) SCROLLERS (Continue watching/reading rows)
   ============================================================ */
document.querySelectorAll('.scrollLeft').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    btn.closest('.panel')?.querySelector('.hscroll')?.scrollBy({left:-320, behavior:'smooth'});
  });
});
document.querySelectorAll('.scrollRight').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    btn.closest('.panel')?.querySelector('.hscroll')?.scrollBy({left:320, behavior:'smooth'});
  });
});

/* ============================================================
   5) SAVED LIST (localStorage)
   ============================================================ */
function getSaved(){ try { return JSON.parse(localStorage.getItem('dj_saved')||'[]'); } catch(e){ return []; } }
function setSaved(list){ localStorage.setItem('dj_saved', JSON.stringify(list)); }
function addSaved(item){
  const list = getSaved();
  if(!list.some(x=>x.t===item.t && x.by===item.by)){ list.push(item); setSaved(list); }
}
function removeSaved(title){
  const list = getSaved().filter(x=>x.t!==title); setSaved(list); renderSaved();
}
function injectSaveButtons(){
  document.querySelectorAll('.card').forEach(card=>{
    if(card.querySelector('.save-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'pill sm save-btn';
    btn.textContent = 'Save';
    const t = card.querySelector('h4')?.textContent?.trim() || 'Untitled';
    const by = card.querySelector('.byline')?.textContent?.replace(/^by\s*/i,'').trim() || 'Unknown';
    const img = card.querySelector('img')?.getAttribute('src') || 'assets/no-manga.png';
    btn.addEventListener('click', ()=>{ addSaved({t, by, img}); btn.textContent='Saved ✓'; setTimeout(()=>btn.textContent='Save', 1000);});
    const row = document.createElement('div');
    row.className = 'actions-row'; row.appendChild(btn);
    card.appendChild(row);
  });
}
function renderSaved(){
  const mount = document.getElementById('savedList');
  if(!mount) return;
  const list = getSaved();
  mount.innerHTML = list.length ? '' : '<p class="kicker">Nothing saved yet. Find something you like and hit “Save”.</p>';
  list.forEach(item=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${item.img}"/>
      <h4>${item.t}</h4>
      <div class="byline">by ${item.by}</div>
      <div class="actions-row"><button class="pill sm remove-btn" data-title="${item.t}">Remove</button></div>`;
    mount.appendChild(el);
  });
  mount.addEventListener('click', (e)=>{
    const btn = e.target.closest('.remove-btn');
    if(btn){ removeSaved(btn.dataset.title); }
  }, { once:true });
}

/* ============================================================
   6) LOGIN DEMO (localStorage)
   ============================================================ */
function updateLoginLink(){
  const link = document.getElementById('loginLink');
  if(!link) return;
  const auth = JSON.parse(localStorage.getItem('dj_auth')||'null');
  if(auth){
    link.textContent = 'Log Out';
    link.href = '#logout';
    link.addEventListener('click', (e)=>{
      e.preventDefault(); localStorage.removeItem('dj_auth'); location.reload();
    }, { once:true });
  }
}
function wireLoginForm(){
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('email')?.value.trim();
    const remember = document.getElementById('remember')?.checked;
    if(email){
      localStorage.setItem('dj_auth', JSON.stringify({email, remember, ts:Date.now()}));
      window.location.href = 'index.html';
    }
  });
}

/* ============================================================
   7) INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', ()=>{
  injectHeader();
  injectSidebar();

  updateLoginLink();

  renderFeatured(featIdx);
  wireFeaturedArrows();

  injectSaveButtons();
  renderSaved();

  wireLoginForm();
});
