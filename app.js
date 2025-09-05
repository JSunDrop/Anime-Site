// Router & views including professional Landing
const app = document.getElementById("app");
addEventListener("hashchange", render);
addEventListener("load", render);

function route(){
  const hash = location.hash || "#/landing";
  const [_, path, a, b] = hash.split("/");
  return { path, a, b };
}
function render(){
  const { path, a, b } = route();
  switch(path){
    case "landing": return landing();
    case "home": return home();
    case "explore": return explore();
    case "work": return workView(a, b);
    case "leaderboard": return leaderboard();
    case "market": return market();
    case "studio": return studio(a, b);
    case "advanced": return advanced();
    case "forum": return forum();
    case "live": return live();
    case "publish": return publish();
    case "policy": return policy();
    default: return landing();
  }
}

// Command palette
let cmdkOpen = false;
addEventListener("keydown", (e)=>{
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="k"){
    e.preventDefault(); toggleCmdk(true);
  } else if(e.key==="Escape" && cmdkOpen){ toggleCmdk(false); }
});
function toggleCmdk(open){
  cmdkOpen = open; const el = document.getElementById("cmdk");
  el.setAttribute("aria-hidden", open ? "false" : "true");
  if(open){
    const input = document.getElementById("cmdk-input");
    const results = document.getElementById("cmdk-results");
    input.value = ""; input.focus();
    const items = [
      ["Go to Overview","#/landing"],["Enter App","#/home"],["Explore","#/explore"],["Shop","#/market"],["Forum","#/forum"],["Live Chat","#/live"],["Advanced","#/advanced"],["Publish","#/publish"]
    ].concat(state.works.map(w => [`Open: ${w.title}`, `#/work/${w.slug}`]));
    function renderList(q=""){
      const ql = q.toLowerCase();
      results.innerHTML = items.filter(([name]) => name.toLowerCase().includes(ql))
        .slice(0,30).map(([name,href]) => `<a href="${href}" onclick="document.getElementById('cmdk').setAttribute('aria-hidden','true')">${name}</a>`).join("");
    }
    input.oninput = () => renderList(input.value);
    renderList();
  }
}

// Toasts
function renderToasts(){
  const wrap = document.getElementById("toast");
  wrap.innerHTML = state.notifications.map(n => `<div class="toast">${n.text}</div>`).join("");
  setTimeout(()=>{ state.notifications.shift(); wrap.innerHTML=""; }, 2200);
}

// Onboarding: enforce DOB prompt
function ensureDOB(){
  if(!state.account?.dob){
    app.innerHTML = `<section class="section panel vstack">
      <h2 style="margin:0;">Create Your Profile</h2>
      <p class="notice">We require your date of birth to enforce content age restrictions. (Stored locally in this prototype.)</p>
      <label>Handle <input id="handle" class="input" placeholder="yourname"/></label>
      <label>Display name <input id="display" class="input" placeholder="Your Name"/></label>
      <label>Date of Birth <input id="dob" class="input" type="date"/></label>
      <div class="hstack" style="justify-content:flex-end;">
        <button class="button primary" id="save">Save</button>
      </div>
    </section>`;
    document.getElementById("save").addEventListener("click", () => {
      const h = document.getElementById("handle").value.trim() || "demo";
      const d = document.getElementById("display").value.trim() || "Demo User";
      const dob = document.getElementById("dob").value;
      if(!dob) return alert("Please set your DOB.");
      const me = state.users.find(u=>u.id===state.account.userId);
      me.handle = h; me.displayName = d; state.account.dob = dob; saveState();
      location.hash = "#/home";
    });
    return false;
  }
  return true;
}

// ---------- Landing (professional) ----------
function landing(){
  app.innerHTML = `
  <section class="hero section">
    <div class="panel soft vstack">
      <h1 class="title">The creator-first platform for anime & manga.</h1>
      <p class="subtitle">Publish series, run a studio, and connect with fans — with smart age protection and a fair <b>1% platform fee</b>.</p>
      <div class="hstack">
        <a class="button primary" href="#/home">Enter App</a>
        <a class="button" href="#/studio">For Studios</a>
        <a class="button" href="#/explore">For Fans</a>
      </div>
      <div class="hstack" style="gap:10px;margin-top:8px;">
        <span class="pill">Age-gated content</span>
        <span class="pill">Studio Office</span>
        <span class="pill">Reader & Player</span>
        <span class="pill">Forum & Live Chat</span>
        <span class="pill">Marketplace</span>
      </div>
    </div>
    <div class="panel vstack">
      <img src="assets/placeholder.svg" style="width:100%;border-radius:14px;aspect-ratio:16/10;object-fit:cover" alt="Product preview"/>
      <div style="font-size:13px;color:var(--muted)">Product preview (placeholder)</div>
    </div>
  </section>

  <section id="features" class="section vstack">
    <div class="kpis">
      <div class="panel"><div style="font-size:32px;font-weight:900">1%</div><div class="muted">Platform fee</div></div>
      <div class="panel"><div style="font-size:32px;font-weight:900">E / T / M / X</div><div class="muted">Ratings with age gate</div></div>
      <div class="panel"><div style="font-size:32px;font-weight:900">Studio</div><div class="muted">Collaborative workspace</div></div>
      <div class="panel"><div style="font-size:32px;font-weight:900">Realtime</div><div class="muted">Forum & Live chat</div></div>
    </div>
    <div class="feature-grid">
      <div class="panel"><h3 style="margin:0;">For Fans</h3><p>Discover, follow studios, favorite series, resume where you left off, and join the conversation.</p></div>
      <div class="panel"><h3 style="margin:0;">For Creators</h3><p>Publish chapters/episodes, manage tasks in Studio Office, and sell digital goods with a fair fee.</p></div>
      <div class="panel"><h3 style="margin:0;">Trust & Safety</h3><p>Age checks on profiles, rating enforcement, and reporting tools for the community.</p></div>
      <div class="panel"><h3 style="margin:0;">Performance</h3><p>Fast static app you can deploy anywhere. Upgrade path to Next.js + Supabase.</p></div>
    </div>
  </section>

  <section id="how" class="section vstack">
    <div class="panel vstack">
      <h2 style="margin:0;">How it works</h2>
      <ol>
        <li>Create a profile and set your date of birth.</li>
        <li>Enter the App to read/watch or build a Studio and publish your work.</li>
        <li>Organize your team in the Office; link tasks to chapters/episodes.</li>
        <li>Engage your audience through comments, forum, and live chat.</li>
      </ol>
    </div>
    <div class="screens">
      <div class="panel"><img src="assets/placeholder.svg" class="thumb" alt="Explore"/></div>
      <div class="panel"><img src="assets/placeholder.svg" class="thumb" alt="Reader"/></div>
      <div class="panel"><img src="assets/placeholder.svg" class="thumb" alt="Studio Office"/></div>
    </div>
  </section>

  <section id="faq" class="section faq">
    <div class="panel vstack">
      <h2 style="margin:0;">FAQ</h2>
      <details><summary>How do you enforce age restrictions?</summary><div>Users set their date of birth in their profile. The app blocks content above their age. In production, this is enforced server‑side.</div></details>
      <details><summary>What’s the fee?</summary><div>Just 1% platform fee on creator earnings (payment processor fees still apply).</div></details>
      <details><summary>Can teams collaborate?</summary><div>Yes — the Studio Office includes a kanban board, chat/notes, and task linking to chapters/episodes.</div></details>
    </div>
  </section>

  <section class="section panel vstack" style="text-align:center">
    <h2 style="margin:0;">Ready to dive in?</h2>
    <div class="hstack" style="justify-content:center">
      <a class="button primary" href="#/home">Enter App</a>
      <a class="button" href="#/studio">Start a Studio</a>
    </div>
  </section>
  `;
}

// ---------- App Home ----------
function home(){
  if(!ensureDOB()) return;
  const featured = [...state.works].slice(0, 3);
  const recs = recommend();
  const favorites = state.works.filter(w => state.favorites.includes(w.id));

  app.innerHTML = `
  <section class="section hero">
    <div class="panel soft vstack">
      <h1 class="title">Create. Publish. Collaborate.</h1>
      <p class="subtitle">For fans and creators. Read manga, watch episodes, publish as a Studio, and sell with a simple <b>1% platform fee</b>.</p>
      <div class="hstack">
        <a class="button primary" href="#/explore">Explore Now</a>
        <a class="button" href="#/studio">Your Studio</a>
        <a class="button" href="#/forum">Forum</a>
      </div>
    </div>
    <div class="panel vstack">
      <h3 style="margin:0;">Featured</h3>
      <div class="grid">${featured.map(card).join("")}</div>
    </div>
  </section>

  <section class="section panel vstack">
    <h3 style="margin:0;">Recommended for You</h3>
    <div class="grid">${recs.map(card).join("")}</div>
  </section>

  <section class="section panel vstack">
    <h3 style="margin:0;">Your Favorites</h3>
    <div class="grid">${(favorites.length?favorites:state.works.slice(0,6)).map(card).join("")}</div>
  </section>
  `;
}

// Explore with sort + tags
function explore(){
  if(!ensureDOB()) return;
  const tags = uniqueTags();
  app.innerHTML = `
  <section class="section panel vstack">
    <div class="hstack" style="justify-content:space-between;align-items:center;">
      <h2 style="margin:0;">Explore</h2>
      <div class="hstack">
        <input id="q" class="input" placeholder="Search titles or tags"/>
        <select id="sort" class="input" style="max-width:200px;">
          <option value="trending">Trending</option>
          <option value="new">Newest</option>
          <option value="top">Top liked</option>
        </select>
      </div>
    </div>
    <div id="tagbar" class="hstack" style="flex-wrap:wrap;margin-top:8px;">
      ${tags.map(t => `<span class="badge tag" data-tag="${t}">#${t}</span>`).join("")}
    </div>
    <div id="results" class="grid" style="margin-top:12px;">
      ${state.works.map(card).join("")}
    </div>
  </section>`;

  const q = document.getElementById("q");
  const sortSel = document.getElementById("sort");
  const results = document.getElementById("results");
  const activeTags = new Set();
  function rerender(){
    const hits = searchWorks(q.value, Array.from(activeTags));
    const sorted = sortWorks(hits, sortSel.value);
    results.innerHTML = sorted.map(card).join("");
  }
  q.addEventListener("input", rerender);
  sortSel.addEventListener("change", rerender);
  document.querySelectorAll(".tag").forEach(el => el.addEventListener("click", () => {
    const t = el.getAttribute("data-tag");
    if(activeTags.has(t)){ activeTags.delete(t); el.classList.remove("active"); }
    else { activeTags.add(t); el.classList.add("active"); }
    rerender();
  }));
}

function card(w){
  const studio = studioById(w.studioId);
  const locked = isLockedWork(w);
  const fav = isFavorite(w.id);
  return `
    <div class="card ${locked?'locked':''}">
      <a href="${locked?'#//blocked':('#/work/'+w.slug)}" ${locked?'onclick="event.preventDefault();alert(\\'Age restriction: '+RATING_LABEL[w.rating]+'\\')"' : ''}>
        <img class="thumb" src="${w.cover}" alt="${w.title} cover"/>
      </a>
      <div class="content">
        <div class="hstack" style="justify-content:space-between;">
          <a href="${locked?'#//blocked':('#/work/'+w.slug)}"><strong>${w.title}</strong></a>
          <span class="badge">${w.kind}</span>
        </div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px;">by ${studio?.name ?? "Unknown"}</div>
        <div style="margin-top:6px;">${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")}
          <span class="badge">Rated ${w.rating}</span>
        </div>
        <div class="hstack" style="justify-content:flex-end;margin-top:6px;">
          <button class="button" data-fav="${w.id}">${fav?'★ Favorited':'☆ Favorite'}</button>
        </div>
      </div>
    </div>`;
}

// Work view with report + comments
function workView(slug, partIndexStr){
  if(!ensureDOB()) return;
  const w = workBySlug(slug);
  if(!w){ app.innerHTML = `<div class="panel"><h2>Work not found</h2></div>`; return; }
  if(isLockedWork(w)){
    app.innerHTML = `<section class="section panel vstack">
      <h2>Age Restricted</h2>
      <div class="lock">This work is rated <b>${w.rating}</b> (${RATING_LABEL[w.rating]}). Your age (${userAge()}) does not meet the requirement.</div>
      <a class="button" href="#/advanced">Go to Advanced</a>
    </section>`; return;
  }
  const studio = studioById(w.studioId);
  const parts = partsOfWork(w);
  const startPart = partIndexStr ? parts.find(p=>String(p.index)===String(partIndexStr)) : getStartPart(w);
  const current = startPart || parts[0];
  const currentIdx = parts.findIndex(p => p.id === current.id);
  const next = parts[currentIdx+1] || null;
  const fav = isFavorite(w.id);

  app.innerHTML = `
  <section class="section two-col">
    <div class="vstack">
      <div class="panel vstack">
        <div class="hstack" style="gap:18px;justify-content:space-between;">
          <div class="hstack" style="gap:18px;">
            <img src="${w.cover}" style="width:140px;height:186px;border-radius:14px;object-fit:cover"/>
            <div class="vstack" style="gap:6px;">
              <h2 style="margin:0;">${w.title} <span class="badge">${w.kind}</span> <span class="badge">Rated ${w.rating}</span></h2>
              <div style="color:var(--muted)">by <a href="#/studio/${studio.slug}">${studio.name}</a></div>
              <p style="margin:0;">${w.synopsis||""}</p>
              <div>${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")}</div>
              <div class="hstack">
                <a class="button" href="#/work/${w.slug}/part/${parts[0].index}">Start at ${w.kind==="manga"?"Chapter":"Episode"} 1</a>
                <a class="button primary" href="#/work/${w.slug}/part/${current.index}">${getProgress(w.id) ? "Resume" : "Read/Watch"}</a>
                <button class="button" id="favBtn">${fav?'★ Favorited':'☆ Favorite'}</button>
                <button class="button danger" id="reportBtn">Report</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel vstack" id="viewer"></div>

      <div class="panel vstack" id="comments">
        <h3 style="margin:0;">Comments</h3>
        <div id="commentList"></div>
        <div class="hstack">
          <input id="commentText" class="input" placeholder="Share your thoughts"/>
          <button class="button primary" id="sendComment">Post</button>
        </div>
      </div>

      ${next ? `<div class="panel hstack" style="justify-content:space-between;">
        <div>Up Next: <b>${w.kind==="manga"?"Chapter":"Episode"} ${next.index}</b> — ${next.title||""}</div>
        <a class="button primary" href="#/work/${w.slug}/part/${next.index}">Next →</a>
      </div>` : ""}
    </div>

    <aside class="sidebar vstack">
      <div class="panel vstack">
        <h3 style="margin:0;">${w.kind==="manga"?"Chapters":"Episodes"}</h3>
        ${parts.map(p => `<a class="hstack" href="#/work/${w.slug}/part/${p.index}" style="justify-content:space-between;padding:8px;border-bottom:1px solid #223154;">
          <div>${w.kind==="manga"?"Ch.":"Ep."} ${p.index}: ${p.title||""}</div>
          <div class="hstack"><span class="badge">${p.likes} ❤</span><span class="badge">${p.views} 👁</span></div>
        </a>`).join("")}
      </div>
    </aside>
  </section>`;

  document.getElementById("favBtn").addEventListener("click", ()=>{ toggleFavorite(w.id); workView(slug, partIndexStr); });
  document.getElementById("reportBtn").addEventListener("click", ()=>{
    const reason = prompt("Reason (spam, gore, sexual content, harassment, other):");
    if(!reason) return;
    const details = prompt("Optional details:");
    reportContent({ workId: w.id, reason, details });
  });

  // Like handlers in viewer
  function renderViewer(part){
    if(isLockedPart(part)){
      document.getElementById("viewer").innerHTML = `<div class="lock">This ${w.kind==="manga"?"chapter":"episode"} is rated <b>${part.rating}</b> (${RATING_LABEL[part.rating]}). Age ${RATING_MIN_AGE[part.rating]}+ required.</div>`;
      return;
    }
    markProgress(w.id, part.index, 1);
    const liked = !!state.likes[part.id]; const likeIcon = liked ? "♥" : "♡";
    const meta = `<div class="hstack" style="justify-content:space-between;">
      <div class="hstack" style="gap:8px;">
        <strong>${w.kind==="manga"?"Chapter":"Episode"} ${part.index}:</strong> ${part.title||""}
        <span class="badge">Rated ${part.rating}</span>
        <span class="badge">${part.likes} likes</span><span class="badge">${part.views} views</span>
      </div>
      <button class="button" data-like="${part.id}">${likeIcon} Like</button>
    </div>`;
    const content = w.kind==="manga" ? mangaViewer(part) : videoViewer(part);
    document.getElementById("viewer").innerHTML = meta + content;
    document.querySelectorAll("[data-like]").forEach(b => b.addEventListener("click", () => { toggleLike(part.id); render(); }));
  }
  renderViewer(current);

  // Comments
  function renderComments(){
    const list = document.getElementById("commentList");
    const items = commentsFor("work", w.id);
    list.innerHTML = items.map(c => {
      const u = userById(c.by);
      return `<div class="comment"><b>@${u?.handle || "user"}</b> — <span style="color:var(--muted)">${new Date(c.at).toLocaleString()}</span><br/>${c.text}</div>`;
    }).join("") || `<div style="color:var(--muted)">No comments yet. Be first!</div>`;
    document.getElementById("sendComment").addEventListener("click", () => {
      const t = document.getElementById("commentText"); const txt = t.value.trim(); if(!txt) return;
      addComment("work", w.id, txt); t.value=""; renderComments();
    });
  }
  renderComments();
}

function mangaViewer(part){
  const pages = part.pages.sort((a,b)=>a.pageNum-b.pageNum);
  return `<div class="vstack" style="gap:8px;margin-top:8px;">
    ${pages.map(pg => `<img src="${pg.imageUrl}" alt="page ${pg.pageNum}" class="thumb" style="max-width:900px;margin:0 auto;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,0.35)"/>`).join("")}
  </div>`;
}
function videoViewer(part){
  return `<div class="panel" style="background:#0a0f1e;margin-top:8px;">
    <div style="aspect-ratio:16/9;background:#0c1020;border-radius:12px;display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,0.35)">
      <div class="vstack" style="align-items:center;">
        <div style="font-size:54px;">▶</div>
        <div style="color:var(--muted)">Video placeholder — integrate HLS later</div>
      </div>
    </div>
  </div>`;
}

// Leaderboard
function leaderboard(){
  if(!ensureDOB()) return;
  const rows = allParts().map(p => ({
    id:p.id, title:p.title,
    work: state.works.find(w => w.parts.includes(p))?.title ?? "",
    studio: studioById(state.works.find(w => w.parts.includes(p))?.studioId)?.name ?? "",
    likes:p.likes, views:p.views, score: (p.likes*2)+Math.floor(p.views/10)
  })).sort((a,b)=>b.score-a.score).slice(0,50);
  app.innerHTML = `<section class="section panel">
    <h2 style="margin-top:0;">Leaderboard</h2>
    <table class="table">
      <thead><tr><th>#</th><th>Work</th><th>Part</th><th>Studio</th><th>Likes</th><th>Views</th><th>Score</th></tr></thead>
      <tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${r.work}</td><td>${r.title}</td><td>${r.studio}</td><td>${r.likes}</td><td>${r.views}</td><td>${r.score}</td></tr>`).join("")}</tbody>
    </table>
  </section>`;
}

// Market
function market(){
  if(!ensureDOB()) return;
  const items = state.listings.filter(l=>l.active);
  app.innerHTML = `<section class="section vstack">
    <div class="panel vstack">
      <h2 style="margin:0;">Marketplace</h2>
      <div class="grid">${items.map(itemCard).join("")}</div>
    </div>
    <div class="panel vstack">
      <div class="hstack" style="justify-content:space-between;">
        <h3 style="margin:0;">Cart</h3>
        <button class="button danger" id="clearCart">Clear</button>
      </div>
      <div id="cartList"></div>
      <div id="totals" style="margin-top:10px;"></div>
      <div class="hstack" style="justify-content:flex-end;">
        <button class="button success" id="checkout">Checkout (Simulated)</button>
      </div>
    </div>
  </section>`;
  function itemCard(l){
    const w = state.works.find(x=>x.id===l.workId);
    const studio = studioById(w.studioId);
    const locked = isLockedWork(w);
    return `<div class="card ${locked?'locked':''}">
      <img class="thumb" src="${w.cover}" alt="${w.title} cover"/>
      <div class="content vstack">
        <strong>${l.title}</strong>
        <div style="color:var(--muted);font-size:13px;">by ${studio.name}</div>
        <div style="margin-top:6px;"><span class="badge">${w.kind}</span> ${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")} <span class="badge">Rated ${w.rating}</span></div>
        <div class="hstack" style="justify-content:space-between;margin-top:8px;">
          <div><b>${currency(l.priceCents,l.currency)}</b></div>
          ${locked ? `<span class="badge">Locked</span>` : `<button class="button primary" data-add="${l.id}">Add</button>`}
        </div>
      </div>
    </div>`;
  }
  function renderCart(){
    const itemsHtml = state.cart.map(ci => {
      const l = state.listings.find(x=>x.id===ci.listingId); if(!l) return "";
      const w = state.works.find(x=>x.id===l.workId);
      return `<div class="hstack" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid #223154;">
        <div class="hstack" style="gap:10px;">
          <img src="${w.cover}" style="width:44px;height:60px;border-radius:8px;object-fit:cover"/>
          <div><div><b>${l.title}</b></div><div style="color:var(--muted);font-size:13px;">Qty: ${ci.qty}</div></div>
        </div>
        <div class="hstack" style="gap:8px;">
          <div>${currency(l.priceCents*ci.qty,l.currency)}</div>
          <button class="button" data-remove="${ci.listingId}">✕</button>
        </div>
      </div>`;
    }).join("");
    document.getElementById("cartList").innerHTML = itemsHtml || `<div style="color:var(--muted)">Your cart is empty.</div>`;
    const pb = priceBreakdown();
    document.getElementById("totals").innerHTML = `<div class="vstack" style="align-items:flex-end;">
      <div>Subtotal: <b>${currency(pb.subtotal)}</b></div>
      <div>Platform fee (1%): <b>${currency(pb.platformFee)}</b></div>
      <div>Payment fee (simulated): <b>${currency(pb.paymentFee)}</b></div>
      <div>Creator payout (after fees): <b>${currency(pb.creatorPayout)}</b></div>
    </div>`;
    document.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", e => { removeFromCart(e.currentTarget.getAttribute("data-remove")); renderCart(); }));
  }
  renderCart();
  document.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", e => { addToCart(e.currentTarget.getAttribute("data-add"),1); renderCart(); }));
  document.getElementById("clearCart").addEventListener("click", ()=>{ state.cart=[]; saveState(); renderCart(); });
  document.getElementById("checkout").addEventListener("click", ()=>{ const r = simulateCheckout(); notify(r.message); renderCart(); });
}

// Studio (simplified)
function studio(){
  if(!ensureDOB()) return;
  const mine = state.studios.find(s => s.ownerId===state.me);
  if(!mine){
    app.innerHTML = `<section class="section panel vstack">
      <h2>Create Your Studio</h2>
      <label>Name <input id="sName" class="input" placeholder="Studio name"/></label>
      <label>Slug <input id="sSlug" class="input" placeholder="studio-slug"/></label>
      <label>Bio <textarea id="sBio" class="input" rows="3"></textarea></label>
      <div class="hstack">
        <button class="button primary" id="sCreate">Create Studio</button>
        <a class="button ghost" href="#/home">Cancel</a>
      </div>
    </section>`;
    document.getElementById("sCreate").addEventListener("click", ()=>{
      const name = document.getElementById("sName").value.trim();
      const slug = document.getElementById("sSlug").value.trim();
      const bio = document.getElementById("sBio").value.trim();
      if(!name||!slug) return alert("Name and slug required.");
      const id = "s_"+Math.random().toString(36).slice(2,8);
      state.studios.push({ id, name, slug, bio, ownerId:state.me, members:[state.me], avatar:"assets/placeholder.svg", office:{tasks:[],chat:[]} });
      saveState(); location.hash = "#/studio";
    });
    return;
  }
  const works = state.works.filter(w=>w.studioId===mine.id);
  app.innerHTML = `<section class="section vstack">
    <div class="panel hstack" style="gap:18px;">
      <img src="${mine.avatar}" style="width:96px;height:96px;border-radius:999px;object-fit:cover"/>
      <div class="vstack" style="gap:6px;">
        <h2 style="margin:0;">${mine.name}</h2>
        <div class="badge">@${mine.slug}</div>
        <p style="color:var(--muted);margin:0;">${mine.bio||""}</p>
      </div>
    </div>
    <div class="panel vstack">
      <div class="hstack" style="justify-content:space-between;">
        <h3 style="margin:0;">Works</h3>
        <a class="button" href="#/publish">New Work</a>
      </div>
      <div class="grid">${works.map(card).join("")}</div>
    </div>
  </section>`;
}

// Advanced (DOB + recommendations)
function advanced(){
  if(!ensureDOB()) return;
  const tags = uniqueTags();
  const recs = recommend();
  app.innerHTML = `<section class="section vstack">
    <div class="panel vstack">
      <h2 style="margin:0;">Advanced Search & Recommendations</h2>
      <div class="hstack" style="flex-wrap:wrap;">
        <label style="min-width:260px;">Date of Birth
          <input id="dob" class="input" type="date" value="${state.account.dob || ""}"/>
        </label>
        <div class="pill">Your age detected: ${userAge()}</div>
      </div>
      <div class="notice">Age restrictions are enforced automatically: E(0+), T(13+), M(17+), X(18+). You cannot access content above your age.</div>
      <div class="hstack" style="justify-content:flex-end;">
        <button class="button" id="save">Save</button>
      </div>
    </div>

    <div class="panel vstack">
      <h3 style="margin:0;">Filter by Tags</h3>
      <div id="tagbar" class="hstack" style="flex-wrap:wrap;">${tags.map(t=>`<span class="badge tag" data-tag="${t}">#${t}</span>`).join("")}</div>
      <div class="hstack" style="gap:8px;">
        <input id="q" class="input" placeholder="Search titles or tags"/>
        <button class="button" id="run">Search</button>
      </div>
      <div id="results" class="grid" style="margin-top:12px;"></div>
    </div>

    <div class="panel vstack">
      <h3 style="margin:0;">Recommended for You</h3>
      <div class="grid">${recs.map(card).join("")}</div>
    </div>
  </section>`;

  document.getElementById("save").addEventListener("click", () => {
    const d = document.getElementById("dob").value; if(!d) return alert("Set your DOB.");
    state.account.dob = d; saveState(); notify("Saved. Age updated.");
  });

  const q = document.getElementById("q");
  const results = document.getElementById("results");
  const activeTags = new Set();
  document.querySelectorAll(".tag").forEach(el => el.addEventListener("click", () => {
    const t = el.getAttribute("data-tag");
    if(activeTags.has(t)){ activeTags.delete(t); el.classList.remove("active"); }
    else { activeTags.add(t); el.classList.add("active"); }
  }));
  document.getElementById("run").addEventListener("click", () => {
    const hits = searchWorks(q.value, Array.from(activeTags));
    results.innerHTML = hits.map(card).join("");
  });
}

// Forum (same as V2-lite)
function forum(){
  if(!ensureDOB()) return;
  const cats = state.forum.categories;
  const threads = state.forum.threads;
  app.innerHTML = `<section class="section vstack">
    <div class="panel vstack">
      <h2 style="margin:0;">Forum</h2>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));">
        ${cats.map(c => `<div class="panel"><h3 style="margin:0;">${c.name}</h3><p class="subtitle">${c.description}</p></div>`).join("")}
      </div>
    </div>
    <div class="panel vstack">
      <div class="hstack" style="justify-content:space-between;">
        <h3 style="margin:0;">Latest Threads</h3>
        <button class="button" id="newThread">+ New Thread</button>
      </div>
      <div id="threadList"></div>
    </div>
  </section>`;

  function renderThreads(){
    document.getElementById("threadList").innerHTML = threads.slice(0,50).map(t => {
      const c = cats.find(x=>x.id===t.categoryId);
      const first = t.posts[0];
      const author = userById(first.by);
      return `<div class="vstack" style="gap:4px;padding:10px;border-bottom:1px solid #223154;">
        <div class="hstack" style="justify-content:space-between;">
          <div><b>[${c?.name}]</b> ${t.title}</div>
          <a class="button" href="#/forum/${t.id}">Open</a>
        </div>
        <div style="color:var(--muted);font-size:13px;">by @${author?.handle || 'user'} — ${new Date(first.at).toLocaleString()}</div>
      </div>`;
    }).join("");
    document.querySelectorAll('a[href^="#/forum/"]').forEach(a => a.addEventListener("click", (e) => {
      e.preventDefault(); const id = a.getAttribute("href").split("/")[2]; threadView(id);
    }));
  }
  renderThreads();

  document.getElementById("newThread").addEventListener("click", () => {
    const cat = prompt("Category (general, help, feedback, showcase)?") || "general";
    const map = {general:"c_general",help:"c_help",feedback:"c_feedback",showcase:"c_showcase"};
    const categoryId = map[cat.toLowerCase()] || "c_general";
    const title = prompt("Thread title:");
    const text = prompt("First post:");
    if(!title || !text) return;
    const th = { id: newId("t"), categoryId, title, authorId: state.me, at: now(), posts: [{ id:newId("po"), by: state.me, at: now(), text }] };
    state.forum.threads.unshift(th); saveState(); renderThreads();
  });
}

function threadView(id){
  const t = state.forum.threads.find(x=>x.id===id);
  if(!t){ alert("Thread not found."); return forum(); }
  app.innerHTML = `<section class="section vstack">
    <div class="panel vstack">
      <div class="hstack" style="justify-content:space-between;">
        <h2 style="margin:0;">${t.title}</h2>
        <a class="button" href="#/forum">Back</a>
      </div>
      <div class="vstack" id="posts"></div>
      <div class="hstack">
        <input id="postText" class="input" placeholder="Reply..."/>
        <button class="button primary" id="sendPost">Reply</button>
      </div>
    </div>
  </section>`;
  function renderPosts(){
    const wrap = document.getElementById("posts");
    wrap.innerHTML = t.posts.map(p => {
      const u = userById(p.by);
      return `<div class="comment"><b>@${u?.handle || 'user'}</b> — <span style="color:var(--muted)">${new Date(p.at).toLocaleString()}</span><br/>${p.text}</div>`;
    }).join("");
  }
  renderPosts();
  document.getElementById("sendPost").addEventListener("click", () => {
    const txt = document.getElementById("postText").value.trim(); if(!txt) return;
    t.posts.push({ id:newId("po"), by: state.me, at: now(), text: txt }); saveState(); renderPosts(); document.getElementById("postText").value = "";
  });
}

// Live chat (General)
let liveTimer = null;
function live(){
  if(!ensureDOB()) return;
  app.innerHTML = `<section class="section panel vstack">
    <h2 style="margin:0;">Live Chat — General</h2>
    <div id="liveBox" class="chat"></div>
    <div class="hstack">
      <input id="liveText" class="input" placeholder="Say something..."/>
      <button class="button primary" id="sendLive">Send</button>
    </div>
  </section>`;
  function renderLive(){
    const msgs = liveMessages();
    const box = document.getElementById("liveBox");
    box.innerHTML = msgs.slice(-200).map(m => {
      const u = userById(m.by);
      return `<div class="msg"><b>@${u?.handle || 'user'}</b> — ${new Date(m.at).toLocaleTimeString()}<br/>${m.text}</div>`;
    }).join("");
    box.scrollTop = box.scrollHeight;
  }
  renderLive();
  document.getElementById("sendLive").addEventListener("click", () => {
    const t = document.getElementById("liveText"); const txt = t.value.trim(); if(!txt) return; sendLive(txt); t.value=""; renderLive();
  });
  if(liveTimer) clearInterval(liveTimer);
  liveTimer = setInterval(renderLive, 2000);
}

// Publish (unchanged minimal creator flow)
function publish(){
  if(!ensureDOB()) return;
  const myStudios = state.studios.filter(s=>s.ownerId===state.me);
  app.innerHTML = `<section class="section vstack">
    <div class="panel vstack">
      <h2 style="margin-top:0;">Publish a New Work</h2>
      <label>Studio
        <select id="pubStudio" class="input">${myStudios.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}</select>
      </label>
      <label>Title <input id="pubTitle" class="input" placeholder="e.g., Foxfire Chronicle"/></label>
      <label>Kind
        <select id="pubKind" class="input"><option value="manga">Manga</option><option value="animation">Animation</option></select>
      </label>
      <label>Rating
        <select id="pubRating" class="input"><option value="E">Everyone (E)</option><option value="T" selected>Teen (T)</option><option value="M">Mature (M)</option><option value="X">Explicit (X)</option></select>
      </label>
      <label>Synopsis <textarea id="pubSynopsis" class="input" rows="3"></textarea></label>
      <label>Tags (comma-separated) <input id="pubTags" class="input" placeholder="shounen, fantasy"/></label>
      <div class="hstack"><button class="button primary" id="createWork">Create Work</button><a class="button ghost" href="#/studio">Back to Studio</a></div>
    </div>
    <div id="afterCreate"></div>
  </section>`;

  document.getElementById("createWork").addEventListener("click", () => {
    const studioId = document.getElementById("pubStudio").value;
    const title = document.getElementById("pubTitle").value.trim();
    const kind = document.getElementById("pubKind").value;
    const rating = document.getElementById("pubRating").value;
    const synopsis = document.getElementById("pubSynopsis").value.trim();
    const tags = document.getElementById("pubTags").value.split(",").map(t=>t.trim()).filter(Boolean);
    if(!title) return alert("Title is required.");
    const id = "w_"+Math.random().toString(36).slice(2,8);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    state.works.unshift({ id, studioId, kind, title, slug, synopsis, tags, rating, cover:"assets/placeholder.svg", createdAt:now(), parts:[] });
    saveState();
    document.getElementById("afterCreate").innerHTML = partCreator({ id, slug, kind });
    bindPartHandlers(id, slug, kind);
  });

  function partCreator(w){
    return `<div class="panel vstack" style="margin-top:16px;">
      <h3 style="margin:0;">Add ${w.kind==="manga"?"Chapter":"Episode"}</h3>
      <label>Title <input id="partTitle" class="input" placeholder="${w.kind==="manga"?"Chapter":"Episode"} 1"/></label>
      <label>Rating
        <select id="partRating" class="input"><option value="E">Everyone (E)</option><option value="T" selected>Teen (T)</option><option value="M">Mature (M)</option><option value="X">Explicit (X)</option></select>
      </label>
      <button class="button" id="addPart">Create</button>
      <div id="partArea" style="margin-top:12px;"></div>
    </div>`;
  }
  function bindPartHandlers(workId, slug, kind){
    document.getElementById("addPart").addEventListener("click", () => {
      const title = document.getElementById("partTitle").value.trim() || "Untitled";
      const rating = document.getElementById("partRating").value;
      const w = state.works.find(w=>w.id===workId);
      const nextIndex = (w.parts.map(p=>p.index).sort((a,b)=>b-a)[0] || 0) + 1;
      const pid = "p_"+Math.random().toString(36).slice(2,8);
      const p = { id:pid, index: nextIndex, title, rating, public:true, publishedAt: now(), pages:[], video:null, likes:0, views:0 };
      w.parts.push(p); saveState();
      const area = document.getElementById("partArea");
      area.innerHTML = `<div class="vstack">
        <h4 style="margin:0;">Upload Pages (PNG/JPG)</h4>
        <input type="file" id="pageFiles" accept="image/*" multiple/>
        <button class="button primary" id="savePages">Save Pages</button>
        <div id="preview" class="grid" style="margin-top:10px;"></div>
        <div class="hstack" style="justify-content:flex-end;margin-top:10px;">
          <a class="button success" href="#/work/${slug}">View Work →</a>
        </div>
      </div>`;
      const fileInput = document.getElementById("pageFiles");
      const preview = document.getElementById("preview");
      fileInput.addEventListener("change", () => {
        preview.innerHTML = "";
        for(const f of fileInput.files){
          const url = URL.createObjectURL(f);
          const img = document.createElement("img");
          img.src = url; img.className="thumb"; img.style.borderRadius="12px";
          preview.appendChild(img);
        }
      });
      document.getElementById("savePages").addEventListener("click", async () => {
        const files = fileInput.files;
        if(!files?.length) return alert("Choose image files first.");
        for(const file of files){
          const r = await new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file); });
          p.pages.push({ id:"pg_"+Math.random().toString(36).slice(2,8), pageNum: p.pages.length+1, imageUrl: r });
        }
        saveState();
        notify("Pages saved to localStorage! (Prototype)");
      });
    });
  }
}

// Policy (placeholder)
function policy(){
  app.innerHTML = `<section class="section vstack">
    <div class="panel vstack">
      <h2 style="margin:0;">Community Guidelines & Safety</h2>
      <p>Respect other users. Do not post illegal content. Label mature works appropriately. Report issues from any work page.</p>
      <p>Ratings: E (0+), T (13+), M (17+), X (18+).</p>
    </div>
  </section>`;
}
