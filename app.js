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
      <a class="side-link" data-page="profile.html" href="profile.html">Profile</a> <!-- NEW -->
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
  // 1) Add the sidebar to the DOM
  document.body.classList.add('with-sidebar');
  document.body.insertAdjacentHTML('afterbegin', buildSidebar());

  // 2) Mark the current page as active
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.sidebar .side-link[data-page]').forEach(a => {
    a.classList.toggle('active', (a.dataset.page || '').toLowerCase() === file);
  });

  // 3) Studio submenu toggle
  const toggle = document.querySelector('.side-toggle');
  const sub    = document.querySelector('.side-sub');
  if (toggle && sub){
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.closest('.side-group').classList.toggle('open', !open);
    });
  }

  // 4) If you’re on a Studio child page, auto-open the group and highlight it
  const studioChildren = ['publish.html', 'my-projects.html', 'team-settings.html'];
  if (studioChildren.includes(file)){
    const group = document.querySelector('.side-group');
    const tgl   = group?.querySelector('.side-toggle');
    if (group && tgl){
      tgl.setAttribute('aria-expanded', 'true');
      group.classList.add('open');
      tgl.classList.add('active'); // optional: highlight the parent too
    }
  }

  // 5) Close submenu if clicking outside (mobile)
  document.addEventListener('click', (e) => {
    if (!document.body.classList.contains('menu-open')) return;
    const sb  = document.getElementById('sidebar');
    const btn = document.getElementById('menuBtn');
    if (sb && !sb.contains(e.target) && btn && !btn.contains(e.target)){
      document.body.classList.remove('menu-open');
    }
  });
}


/* ============================================================
   3) FEATURED (2 cards at a time, stacked)
   ============================================================ */
const featured = [
  { t:'Railgun Waltz', by:'Mako Reactor', tags:['#action','#fantasy','#steampunk'], img:'assets/no-manga.png', url:'work.html?slug=railgun-waltz' },
  { t:'Azure Lullaby', by:'Mako Reactor', tags:['#drama','#music','#fantasy'], img:'assets/no-video.png', url:'work.html?slug=azure-lullaby' },
  { t:'Spark Runner',  by:'OniWorks',     tags:['#sci-fi','#action','#neon'],     img:'assets/no-video.png', url:'work.html?slug=spark-runner' },
  { t:'Blade of Dawn', by:'OniWorks',     tags:['#shounen','#adventure','#fantasy'], img:'assets/no-manga.png', url:'work.html?slug=blade-of-dawn' }
];

const cardHtml = f => `
  <div class="feat-card" data-href="${f.url}">
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
}/* boot the featured carousel */
let featIdx = 0;

function makeFeaturedCardsClickable() {
  const stage = document.querySelector('.feat-stage');
  if (!stage) return;
  stage.querySelectorAll('.feat-card').forEach(card => {
    const href = card.dataset.href;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.save-btn')) return; // don't navigate when clicking Save
      if (href) window.location.href = href;
    });

    // Keyboard accessibility
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && href) window.location.href = href;
    });
  });
}

// render + wire arrows + clickability on load
document.addEventListener('DOMContentLoaded', () => {
  renderFeatured(featIdx);
  wireFeaturedArrows();
  makeFeaturedCardsClickable();
});

// If you re-render from arrows, reapply clickability
const _oldRenderFeatured = renderFeatured;
renderFeatured = function(i) {
  _oldRenderFeatured(i);
  makeFeaturedCardsClickable();
};


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
// ---- Shop: demo products + local cart ----
(function(){
  const onShop = document.title.includes('Shop');
  if (!onShop) return;

  const products = [
    { id:'p_print_01', t:'Manga Print — Placeholder', kind:'print', price:1200, img:'assets/no-manga.png' },
    { id:'p_poster_01', t:'Poster — Placeholder', kind:'poster', price:1800, img:'assets/no-video.png' },
    { id:'p_bundle_01', t:'Creator Bundle — Placeholder', kind:'bundle', price:3500, img:'assets/no-manga.png' }
  ];

  const cart = JSON.parse(localStorage.getItem('cart')||'[]');

  const $ = s=>document.querySelector(s);
  const grid = $('#shopGrid');
  const count = $('#cartCount');
  const drawer = $('#cartDrawer');
  const items = $('#cartItems');
  const total = $('#cartTotal');

  function money(cents){ return `$${(cents/100).toFixed(2)}`; }
  function save(){ localStorage.setItem('cart', JSON.stringify(cart)); }
  function renderCount(){ count.textContent = cart.reduce((n,i)=>n+i.qty,0); }
  function renderCart(){
    items.innerHTML = '';
    let sum = 0;
    cart.forEach(row=>{
      const p = products.find(x=>x.id===row.id);
      sum += p.price*row.qty;
      const div = document.createElement('div');
      div.className = 'panel';
      div.style.padding = '8px';
      div.innerHTML = `
        <div style="display:grid;grid-template-columns:48px 1fr auto;gap:8px;align-items:center">
          <img src="${p.img}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,.1)" />
          <div>
            <div class="t" style="font-weight:600">${p.t}</div>
            <div class="by">${money(p.price)}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="pill sm" data-dec="${p.id}">−</button>
            <span>${row.qty}</span>
            <button class="pill sm" data-inc="${p.id}">+</button>
          </div>
        </div>`;
      items.appendChild(div);
    });
    total.textContent = money(sum);
  }

  function add(id){
    const row = cart.find(r=>r.id===id);
    row ? row.qty++ : cart.push({id, qty:1});
    save(); renderCount();
  }

  function list(filter='all'){
    grid.innerHTML = '';
    products
      .filter(p=>filter==='all' ? true : p.kind===filter)
      .forEach(p=>{
        const card = document.createElement('div');
        card.className = 'feat-card panel';
        card.innerHTML = `
          <img src="${p.img}" alt="" style="width:220px;height:260px;object-fit:cover;border-radius:12px;border:1px solid rgba(255,255,255,.1)" />
          <div class="meta" style="margin-top:10px">
            <div class="t">${p.t}</div>
            <div class="by">${money(p.price)}</div>
          </div>
          <div style="margin-top:10px">
            <button class="btn" data-add="${p.id}">Add to cart</button>
          </div>
        `;
        grid.appendChild(card);
      });
  }

  // events
  document.addEventListener('click', (e)=>{
    const addId = e.target?.dataset?.add;
    const incId = e.target?.dataset?.inc;
    const decId = e.target?.dataset?.dec;
    const filt = e.target?.dataset?.filter;

    if (addId){ add(addId); }
    if (incId){ add(incId); renderCart(); }
    if (decId){
      const i = cart.findIndex(r=>r.id===decId);
      if (i>-1){ cart[i].qty--; if (cart[i].qty<=0) cart.splice(i,1); save(); renderCart(); renderCount(); }
    }
    if (filt){
      document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active', b.dataset.filter===filt));
      list(filt);
    }
  });

  $('#openCart')?.addEventListener('click', ()=>{ renderCart(); drawer.style.display='block'; });
  $('#closeCart')?.addEventListener('click', ()=>{ drawer.style.display='none'; });
  $('#checkoutBtn')?.addEventListener('click', ()=>{
    alert('Checkout will redirect to Stripe in production. (Demo)');
  });

  // init
  list('all'); renderCount();
})();
// Profile tabs (no-op on pages without tabs)
document.addEventListener('click', (e) => {
  const b = e.target.closest('.tab-btn');
  if (!b) return;
  const wrap = b.closest('.profile-main');
  if (!wrap) return;

  // activate clicked button
  wrap.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');

  // show matching pane
  const key = b.dataset.tab;
  wrap.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  const pane = wrap.querySelector(`#tab-${key}`);
  if (pane) pane.classList.add('active');
});
/* ============================================================
   Make any element with [data-href] behave like a link
   ============================================================ */
function initCardLinks(){
  const els = document.querySelectorAll('[data-href]');
  els.forEach(el=>{
    const url = el.getAttribute('data-href');
    if(!url) return;
    el.setAttribute('role','link');
    el.setAttribute('tabindex','0');
    el.addEventListener('click', ()=> location.href = url);
    el.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); location.href = url; }});
  });
}
document.addEventListener('DOMContentLoaded', initCardLinks);
/* ============================================================
   Burger popover: Profile / Saved / Settings / Studio / Help / Legal / Log in|out
   ============================================================ */
function initBurger(){
  const btn = document.querySelector('#menuBtn,[data-menu-btn]');
  if(!btn) return;

  // build popover once
  let pop = document.getElementById('menuPop');
  if(!pop){
    pop = document.createElement('div');
    pop.id = 'menuPop';
    pop.className = 'menu-pop';
    pop.innerHTML = `
      <a href="profile.html">Profile</a>
      <a href="saved.html">Saved</a>
      <div class="sep"></div>
      <a href="team-settings.html">Settings</a>
      <a href="publish.html">Studio — Publish</a>
      <a href="my-projects.html">Studio — My Projects</a>
      <div class="sep"></div>
      <a href="qa.html">Help / Q&A</a>
      <a href="legal.html">Legal</a>
      <div class="sep"></div>
      <button type="button" id="authToggle">Log In</button>
    `;
    document.body.appendChild(pop);
  }

  // place under the button
  function position(){
    const r = btn.getBoundingClientRect();
    pop.style.top  = `${r.bottom + 8 + window.scrollY}px`;
    pop.style.right= `${Math.max(12, window.innerWidth - r.right)}px`;
  }

  // demo auth state using localStorage
  function paintAuth(){
    const authed = localStorage.getItem('demoAuthed') === '1';
    const authBtn = pop.querySelector('#authToggle');
    authBtn.textContent = authed ? 'Log Out' : 'Log In';
  }

  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    position();
    pop.classList.toggle('open');
    paintAuth();
  });

  // click outside to close
  document.addEventListener('click', (e)=>{
    if(!pop.classList.contains('open')) return;
    if(e.target === pop || pop.contains(e.target) || e.target === btn) return;
    pop.classList.remove('open');
  });

  // demo Log in/out toggle
  pop.addEventListener('click', (e)=>{
    if(e.target.id === 'authToggle'){
      const authed = localStorage.getItem('demoAuthed') === '1';
      if(authed){
        localStorage.removeItem('demoAuthed');
        location.href = 'login.html';
      }else{
        location.href = 'login.html';
      }
    }
  });

  window.addEventListener('resize', ()=>{ if(pop.classList.contains('open')) position(); });
  window.addEventListener('scroll', ()=>{ if(pop.classList.contains('open')) position(); });
}
document.addEventListener('DOMContentLoaded', initBurger);
/* ============================================================
   PROFILE: tabs + edit + avatar + links + share (demo storage)
   ============================================================ */
function initProfile(){
  const root = document.getElementById('profile-root');
  if(!root) return;

  // ---------- Tabs ----------
  const tabs   = root.querySelectorAll('[data-tab]');
  const panels = root.querySelectorAll('[data-panel]');
  function activate(name){
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    panels.forEach(p => p.toggleAttribute('hidden', p.dataset.panel !== name));
    history.replaceState(null,'','#'+name);
  }
  tabs.forEach(t => t.addEventListener('click', ()=> activate(t.dataset.tab)));
  activate((location.hash||'#overview').slice(1));

  // ---------- Demo store ----------
  const Store = {
    get(){ try{ return JSON.parse(localStorage.getItem('pfDemo')) || {}; } catch{ return {}; } },
    set(v){ localStorage.setItem('pfDemo', JSON.stringify(v)); }
  };

  // ---------- Paint helpers ----------
  const nameEl = document.querySelector('[data-profile-name]');
  const bioEl  = document.querySelector('[data-profile-bio]');
  const siteA  = document.getElementById('pfLinkSite');
  const twA    = document.getElementById('pfLinkTw');
  const discA  = document.getElementById('pfLinkDisc');
  const avImg  = document.getElementById('pfAvatarImg');

  function paint(){
    const d = Store.get();
    if(nameEl) nameEl.textContent = d.name || 'Your Display Name';
    if(bioEl)  bioEl.textContent  = d.bio  || 'Short bio goes here. Creator / Fan / Studio owner.';
    if(siteA)  siteA.href = d.site || '#';
    if(twA)    twA.href   = d.tw   || '#';
    if(discA){
      if((d.disc||'').startsWith('http')) discA.href = d.disc;
      else if(d.disc) discA.href = 'https://discord.com/users/'+encodeURIComponent(d.disc.replace(/^@/,''));
      else discA.href = '#';
    }
    if(avImg && d.avatar) avImg.src = d.avatar;
  }
  paint();

  // ---------- Edit dialog ----------
  const dlg    = document.getElementById('editProfile');
  const openB  = document.getElementById('editProfileBtn');
  const saveB  = document.getElementById('pfSaveBtn');
  const pfName = document.getElementById('pfName');
  const pfBio  = document.getElementById('pfBio');
  const pfSite = document.getElementById('pfSite');
  const pfTw   = document.getElementById('pfTw');
  const pfDisc = document.getElementById('pfDisc');
  const pfFileModal = document.getElementById('pfAvatarFileModal');

  if(openB && dlg){
    openB.addEventListener('click', ()=>{
      const d = Store.get();
      pfName && (pfName.value = d.name || '');
      pfBio  && (pfBio.value  = d.bio  || '');
      pfSite && (pfSite.value = d.site || '');
      pfTw   && (pfTw.value   = d.tw   || '');
      pfDisc && (pfDisc.value = d.disc || '');
      dlg.showModal ? dlg.showModal() : dlg.setAttribute('open','');
    });
  }

  async function fileToDataURL(file){
    return new Promise((res,rej)=>{
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror= rej;
      fr.readAsDataURL(file);
    });
  }

  if(saveB && dlg){
    saveB.addEventListener('click', async (e)=>{
      e.preventDefault();
      const d = Store.get();
      const next = {
        name: (pfName?.value || '').trim() || 'Your Display Name',
        bio : (pfBio?.value  || '').trim(),
        site: (pfSite?.value || '').trim(),
        tw  : (pfTw?.value   || '').trim(),
        disc: (pfDisc?.value || '').trim(),
        avatar: d.avatar || ''
      };
      if(pfFileModal && pfFileModal.files && pfFileModal.files[0]){
        next.avatar = await fileToDataURL(pfFileModal.files[0]);
      }
      Store.set(next);
      paint();
      dlg.close ? dlg.close() : dlg.removeAttribute('open');
    });
  }

  // ---------- Avatar quick change from header block ----------
  const pfAvatar = document.getElementById('pfAvatar');
  const pfFile   = document.getElementById('pfAvatarFile');
  if(pfAvatar && pfFile){
    pfAvatar.addEventListener('click', ()=> pfFile.click());
    pfFile.addEventListener('change', async ()=>{
      if(!pfFile.files || !pfFile.files[0]) return;
      const dataUrl = await fileToDataURL(pfFile.files[0]);
      const cur = Store.get(); cur.avatar = dataUrl; Store.set(cur); paint();
    });
  }

  // ---------- Share ----------
  const shareBtn = document.getElementById('shareProfileBtn');
  if(shareBtn){
    shareBtn.addEventListener('click', async ()=>{
      const clean = location.href.replace(/#.*$/,'');
      try{ await navigator.clipboard.writeText(clean); toasty('Profile link copied!'); }
      catch{
        const t = document.createElement('textarea'); t.value = clean; document.body.appendChild(t);
        t.select(); document.execCommand('copy'); t.remove(); toasty('Profile link copied!');
      }
    });
  }

  function toasty(msg){
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `
      position:fixed; left:50%; bottom:28px; transform:translateX(-50%);
      background: rgba(8,16,28,.86); color:#dce9ff; padding:10px 14px;
      border:1px solid rgba(126,162,220,.25); border-radius:12px; z-index:9999;
      box-shadow: 0 8px 32px rgba(0,0,0,.35); backdrop-filter: blur(6px);
    `;
    document.body.appendChild(t);
    setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .25s'; }, 1400);
    setTimeout(()=> t.remove(), 1800);
  }
}
document.addEventListener('DOMContentLoaded', initProfile);
/* ===================================================================
   PROFILE UI POLISH: modal wiring, avatar preview, local persistence
   =================================================================== */
(function initProfileUI(){
  if (!document.getElementById('profile-root')) return;

  const dlg = document.getElementById('editProfile');
  const editBtn = document.getElementById('editProfileBtn');
  const saveBtn = document.getElementById('pfSaveBtn');

  const nameEl = document.querySelector('[data-profile-name]');
  const bioEl  = document.querySelector('[data-profile-bio]');
  const siteA  = document.getElementById('pfLinkSite');
  const twA    = document.getElementById('pfLinkTw');
  const discA  = document.getElementById('pfLinkDisc');

  const nameIn = document.getElementById('pfName');
  const bioIn  = document.getElementById('pfBio');
  const siteIn = document.getElementById('pfSite');
  const twIn   = document.getElementById('pfTw');
  const discIn = document.getElementById('pfDisc');

  const avatarImg   = document.getElementById('pfAvatarImg');
  const avatarFile1 = document.getElementById('pfAvatarFile');
  const avatarFile2 = document.getElementById('pfAvatarFileModal');

  function restore(){
    try{
      const n = localStorage.getItem('pf.name'); if(n) nameEl.textContent = n;
      const b = localStorage.getItem('pf.bio');  if(b) bioEl.textContent  = b;
      const s = localStorage.getItem('pf.site'); if(s) siteA.href         = s;
      const t = localStorage.getItem('pf.tw');   if(t) twA.href           = t;
      const d = localStorage.getItem('pf.disc'); if(d) discA.href         = d;
      const a = localStorage.getItem('pf.avatar'); if(a) avatarImg.src    = a;
    }catch(e){}
  }
  function preview(fileInput){
    const f = fileInput?.files?.[0]; if(!f) return;
    const r = new FileReader();
    r.onload = (e)=>{
      avatarImg.src = e.target.result;
      try{ localStorage.setItem('pf.avatar', e.target.result); }catch(_){}
    };
    r.readAsDataURL(f);
  }

  restore();
  avatarFile1?.addEventListener('change', ()=>preview(avatarFile1));
  avatarFile2?.addEventListener('change', ()=>preview(avatarFile2));

  editBtn?.addEventListener('click', ()=>{
    if (!dlg) return;
    nameIn.value = nameEl?.textContent?.trim() || '';
    bioIn.value  = bioEl?.textContent?.trim()  || '';
    siteIn.value = siteA?.href && siteA.href !== location.href ? siteA.href : '';
    twIn.value   = twA?.href   && twA.href   !== location.href ? twA.href   : '';
    discIn.value = discA?.href && discA.href !== location.href ? discA.href : '';
    dlg.showModal();
  });

  saveBtn?.addEventListener('click', ()=>{
    if (nameEl) nameEl.textContent = nameIn.value || 'Your Display Name';
    if (bioEl)  bioEl.textContent  = bioIn.value  || 'Short bio goes here.';
    if (siteA)  siteA.href          = siteIn.value || '#';
    if (twA)    twA.href            = twIn.value   || '#';
    if (discA)  discA.href          = discIn.value || '#';

    try{
      localStorage.setItem('pf.name', nameIn.value);
      localStorage.setItem('pf.bio',  bioIn.value);
      localStorage.setItem('pf.site', siteIn.value);
      localStorage.setItem('pf.tw',   twIn.value);
      localStorage.setItem('pf.disc', discIn.value);
    }catch(e){}
    dlg.close();
  });

  dlg?.addEventListener('click', (e)=>{ if(e.target === dlg) dlg.close(); });
})();

/* ===================================================================
   HOME CARDS CLICKABLE: Featured + Continue Reading/Watching
   Works if each card has data-href="work.html?slug=..."
   =================================================================== */
(function enableCardClicks(){
  function decorate(el){
    if (!el) return;
    el.tabIndex = 0;
    el.classList.add('card-click');
    el.addEventListener('keydown', (ev)=>{
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        const href = el.dataset.href;
        if (href) location.href = href;
      }
    });
  }
  // current page only
  document.querySelectorAll('.feat-card, .read-card')
    .forEach(decorate);

  document.addEventListener('click', (e)=>{
    const card = e.target.closest('.feat-card, .read-card');
    if (card && card.dataset.href){
      location.href = card.dataset.href;
    }
  });
})();
