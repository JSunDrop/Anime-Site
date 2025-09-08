/* =========================
   SHARED HEADER INJECTION
   ========================= */
function buildHeader(){
  return `
  <div class="wrap header-bar">
    <!-- Brand (logo only) -->
    <a class="brand" href="index.html" aria-label="Dojinova home">
      <img src="assets/dojinova-logo.png" alt="Dojinova" />
    </a>

    <!-- LEFT: flat text nav like Crunchyroll -->
    <nav class="nav-left">
      <a class="nav-link" data-page="index.html" href="index.html">Home</a>
      <a class="nav-link" data-page="explore.html" href="explore.html">Explore</a>
      <a class="nav-link" data-page="shop.html" href="shop.html">Shop</a>
      <a class="nav-link" data-page="leaderboard.html" href="leaderboard.html">Leaderboard</a>

      <div class="nav-item">
        <a class="nav-link" data-page="studio.html" href="studio.html">Studio</a>
        <div class="dropdown">
          <a href="publish.html">Publish</a>
          <a href="my-projects.html">My Projects</a>
          <a href="team-settings.html">Team Settings</a>
        </div>
      </div>

      <a class="nav-link" data-page="forum.html" href="forum.html">Forum</a>
      <a class="nav-link" data-page="live.html" href="live.html">Live</a>
      <a class="nav-link" data-page="discover.html" href="discover.html">Discover</a>
      <a class="nav-link" data-page="qa.html" href="qa.html">Q&amp;A</a>
    </nav>

    <!-- RIGHT: controls (CR-style: icons/links) -->
    <nav class="nav-right">
      <button class="icon-btn" id="searchBtn" aria-label="Search" title="Search">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.71.71l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z"/>
        </svg>
      </button>
      <span class="nav-divider" aria-hidden="true"></span>
      <a class="nav-link" data-page="saved.html" href="saved.html">Saved</a>
      <a class="nav-link" data-page="login.html" id="loginLink" href="login.html">Log In</a>
    </nav>

    <!-- Search popover -->
    <div class="search-popover" id="searchBox">
      <input type="search" placeholder="Search works…" aria-label="Search works">
    </div>
  </div>`;
}



function injectHeader(){
  const hdr = document.querySelector('.site-header');
  if(!hdr) return;
  hdr.innerHTML = buildHeader();

  // Mark active link by file name
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.site-header a.nav-link[data-page]').forEach(a=>{
    if(a.dataset.page.toLowerCase() === file){ a.classList.add('active'); }
  });

  // Simple search popover toggle
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
}


/* =========================
   FEATURED: 2 CARDS AT A TIME
   ========================= */
let idx = 0;
const featured = [
  {t:'Railgun Waltz', by:'Mako Reactor', tags:['#action','#fantasy','#steampunk'], img:'assets/no-video.png'},
  {t:'Azure Lullaby', by:'Mako Reactor', tags:['#drama','#music','#fantasy'], img:'assets/no-manga.png'},
  {t:'Spark Runner', by:'OniWorks', tags:['#sci-fi','#action','#neon'], img:'assets/no-video.png'},
  {t:'Blade of Dawn', by:'OniWorks', tags:['#shounen','#adventure','#fantasy'], img:'assets/no-manga.png'}
];

function cardHtml(f){
  return `
    <div class="feat-card">
      <img src="${f.img}" alt="cover"/>
      <div class="meta">
        <div class="t">${f.t}</div>
        <div class="by">by ${f.by}</div>
        <div class="tags">${f.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="actions-row"><button class="pill sm save-btn">Save</button></div>
      </div>
    </div>`;
}

function renderFeatured(i){
  const stage = document.querySelector('.feat-stage');
  if(!stage) return;
  const a = featured[i % featured.length];
  const b = featured[(i+1) % featured.length];
  stage.innerHTML = cardHtml(a) + cardHtml(b);

  // wire save buttons
  stage.querySelectorAll('.feat-card').forEach(card=>{
    const t = card.querySelector('.t')?.textContent?.trim() || 'Featured';
    const by = card.querySelector('.by')?.textContent?.replace(/^by\\s*/i,'').trim() || 'Unknown';
    const img = card.querySelector('img')?.getAttribute('src') || 'assets/no-manga.png';
    const btn = card.querySelector('.save-btn');
    btn.addEventListener('click', ()=>{
      addSaved({t, by, img});
      btn.textContent = 'Saved ✓';
      setTimeout(()=>btn.textContent='Save', 1200);
    });
  });
}

/* arrows */
function wireFeaturedArrows(){
  const prev = document.getElementById('featPrev');
  const next = document.getElementById('featNext');
  prev?.addEventListener('click', ()=>{ idx = (idx - 2 + featured.length) % featured.length; renderFeatured(idx); });
  next?.addEventListener('click', ()=>{ idx = (idx + 2) % featured.length; renderFeatured(idx); });
}

/* =========================
   CONTINUE READING scrollers
   ========================= */
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

/* =========================
   SAVED LISTS (localStorage)
   ========================= */
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
    const by = card.querySelector('.byline')?.textContent?.replace(/^by\\s*/i,'').trim() || 'Unknown';
    const img = card.querySelector('img')?.getAttribute('src') || 'assets/no-manga.png';
    btn.addEventListener('click', ()=>{ addSaved({t, by, img}); btn.textContent='Saved ✓'; setTimeout(()=>btn.textContent='Save', 1200);});
    const actions = document.createElement('div');
    actions.className = 'actions-row';
    actions.appendChild(btn);
    card.appendChild(actions);
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
      <img src="${item.img}">
      <h4>${item.t}</h4>
      <div class="byline">by ${item.by}</div>
      <div class="actions-row">
        <button class="pill sm remove-btn" data-title="${item.t}">Remove</button>
      </div>`;
    mount.appendChild(el);
  });
  mount.addEventListener('click', (e)=>{
    const btn = e.target.closest('.remove-btn');
    if(btn){ removeSaved(btn.dataset.title); }
  }, { once: true });
}

/* =========================
   LOGIN DEMO (localStorage)
   ========================= */
function updateLoginLink(){
  const link = document.getElementById('loginLink');
  if(!link) return;
  const auth = JSON.parse(localStorage.getItem('dj_auth')||'null');
  if(auth){
    link.textContent = 'Log Out';
    link.href = '#logout';
    link.addEventListener('click', (e)=>{
      e.preventDefault(); localStorage.removeItem('dj_auth'); location.reload();
    }, { once: true });
  }
}
function wireLoginForm(){
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const remember = document.getElementById('remember').checked;
    if(email){
      localStorage.setItem('dj_auth', JSON.stringify({email, remember, ts:Date.now()}));
      window.location.href = 'index.html';
    }
  });
}

/* =========================
   INIT
   ========================= */
document.addEventListener('DOMContentLoaded', ()=>{
  injectHeader();            // one header to rule them all
  updateLoginLink();         // adjust login/logout link
  renderFeatured(idx);       // draw 2 featured
  wireFeaturedArrows();      // prev/next 2-at-a-time
  injectSaveButtons();       // add Save to general cards
  renderSaved();             // populate Saved page (if present)
  wireLoginForm();           // login form (if present)
});
