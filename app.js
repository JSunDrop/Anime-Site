// SPA Router + Grande views + carousel + tag filters
const app = document.getElementById("app");
addEventListener("hashchange", render);
addEventListener("load", render);

function route(){
  const hash = location.hash || "#/";
  const [_, path, a] = hash.split("/");
  return { path, a };
}
function render(){
  const { path, a } = route();
  switch(path){
    case "": return home();
    case "explore": return explore();
    case "work": return workView(a);
    case "leaderboard": return leaderboard();
    case "market": return market();
    case "studio": return studio();
    case "publish": return publish();
    default: app.innerHTML = `<div class="panel"><h2>Not Found</h2></div>`;
  }
}

// --- Views
function home(){
  const featured = [...state.works].slice(0, 3);
  const top = [...state.works].slice(0, 8);

  app.innerHTML = `
  <section class="hero section">
    <div class="panel soft vstack">
      <h1 class="title">Create. Publish. Shine.</h1>
      <p class="subtitle">A home for anime & manga creators and fans. Publish chapters & episodes, build Studios, climb leaderboards, and earn — with a simple <b>1% platform fee</b>.</p>
      <div class="actions hstack">
        <a class="button primary" href="#/publish">Start Publishing</a>
        <a class="button" href="#/explore">Explore Works</a>
        <span class="kbd">Tip:</span> <span class="kbd">/</span> to search
      </div>
    </div>
    <div class="panel">
      <div class="carousel">
        <div class="carousel-track" id="track">
          ${featured.map(f => `
            <div class="carousel-item">
              <a class="card" href="#/work/${f.slug}">
                <img class="thumb" src="${f.cover}" alt="${f.title} cover"/>
                <div class="content">
                  <div class="hstack" style="justify-content:space-between;">
                    <strong>${f.title}</strong>
                    <span class="badge">${f.kind}</span>
                  </div>
                  <div style="color:var(--muted); font-size:13px;">by ${studioById(f.studioId)?.name}</div>
                  <div style="margin-top:6px;">${(f.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")}</div>
                </div>
              </a>
            </div>
          `).join("")}
        </div>
        <div class="carousel-controls">
          <button id="prev">‹</button>
          <button id="next">›</button>
        </div>
      </div>
    </div>
  </section>

  <section class="section panel vstack">
    <div class="hstack" style="justify-content:space-between;">
      <h3 style="margin:0;">Trending Now</h3>
      <a class="button ghost" href="#/leaderboard">View Leaderboard →</a>
    </div>
    <div class="grid">${top.map(card).join("")}</div>
  </section>
  `;

  // Carousel logic
  const track = document.getElementById("track");
  let idx = 0;
  const items = document.querySelectorAll(".carousel-item").length;
  document.getElementById("prev").onclick = () => { idx = (idx - 1 + items) % items; track.style.transform = `translateX(-${idx*100}%)`; };
  document.getElementById("next").onclick = () => { idx = (idx + 1) % items; track.style.transform = `translateX(-${idx*100}%)`; };

  bindSearchShortcut();
}

function explore(){
  const tags = uniqueTags();
  app.innerHTML = `
  <section class="section panel vstack">
    <div class="hstack" style="justify-content:space-between;align-items:center;">
      <h2 style="margin:0;">Explore</h2>
      <input id="q" class="input" placeholder="Search titles or tags (shounen, action, fantasy)"/>
    </div>
    <div id="tagbar" class="tagbar" style="margin-top:8px;">
      ${tags.map(t => `<span class="badge tag" data-tag="${t}">#${t}</span>`).join("")}
    </div>
    <div id="results" class="grid" style="margin-top:12px;">
      ${state.works.map(card).join("")}
    </div>
  </section>`;

  const q = document.getElementById("q");
  const results = document.getElementById("results");
  const tagbar = document.getElementById("tagbar");
  const activeTags = new Set();

  function rerender(){
    const hits = searchWorks(q.value, Array.from(activeTags));
    results.innerHTML = hits.map(card).join("");
  }
  q.addEventListener("input", rerender);
  tagbar.querySelectorAll(".tag").forEach(el => {
    el.addEventListener("click", () => {
      const t = el.getAttribute("data-tag");
      if(activeTags.has(t)){ activeTags.delete(t); el.classList.remove("active"); }
      else { activeTags.add(t); el.classList.add("active"); }
      rerender();
    });
  });

  bindSearchShortcut();
}

function card(w){
  const studio = studioById(w.studioId);
  return `
    <a class="card" href="#/work/${w.slug}" title="${w.title}">
      <img class="thumb" src="${w.cover}" alt="${w.title} cover"/>
      <div class="content">
        <div class="hstack" style="justify-content:space-between;">
          <strong>${w.title}</strong>
          <span class="badge">${w.kind}</span>
        </div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px;">by ${studio?.name ?? "Unknown"}</div>
        <div style="margin-top:6px;">${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")}</div>
      </div>
    </a>
  `;
}

function workView(slug){
  const w = workBySlug(slug);
  if(!w){ app.innerHTML = `<div class="panel"><h2>Work not found</h2></div>`; return; }
  const studio = studioById(w.studioId);
  const parts = partsOfWork(w);

  app.innerHTML = `
  <section class="section vstack">
    <div class="panel vstack">
      <div class="hstack" style="gap:18px;">
        <img src="${w.cover}" style="width:140px;height:186px;border-radius:14px;object-fit:cover"/>
        <div class="vstack" style="gap:6px;flex:1;">
          <h2 style="margin:0;">${w.title}</h2>
          <div class="hstack"><span class="badge">${w.kind}</span>${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")}</div>
          <div style="color:var(--muted)">by <a href="#/studio">${studio.name}</a></div>
          <p style="margin-top:6px;">${w.synopsis||""}</p>
        </div>
      </div>
    </div>
    <div class="panel vstack">
      <h3 style="margin:0;">${w.kind==="manga"?"Chapters":"Episodes"}</h3>
      ${parts.map(partCard).join("")}
    </div>
  </section>`;

  function partCard(p){
    const liked = !!state.likes[p.id];
    const likeIcon = liked ? "♥" : "♡";
    const viewer = w.kind==="manga" ? mangaViewer(p) : videoViewer(p);
    return `
      <div class="vstack" style="gap:10px;padding:12px 0;border-bottom:1px solid #223154;">
        <div class="hstack" style="justify-content:space-between;">
          <div class="hstack" style="gap:8px;">
            <strong>${w.kind==="manga"?"Chapter":"Episode"} ${p.index}:</strong> ${p.title||""}
            <span class="badge">${p.likes} likes</span><span class="badge">${p.views} views</span>
          </div>
          <button class="button" data-like="${p.id}">${likeIcon} Like</button>
        </div>
        ${viewer}
      </div>`;
  }

  document.querySelectorAll("[data-like]").forEach(b => {
    b.addEventListener("click", e => {
      toggleLike(e.currentTarget.getAttribute("data-like"));
      workView(slug);
    });
  });
}

function mangaViewer(part){
  const pages = part.pages.sort((a,b)=>a.pageNum-b.pageNum);
  return `<div class="vstack" style="gap:8px;">
    ${pages.map(pg => `<img src="${pg.imageUrl}" alt="page ${pg.pageNum}" class="thumb" style="max-width:900px;margin:0 auto;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,0.35)"/>`).join("")}
  </div>`;
}
function videoViewer(part){
  return `<div class="panel" style="background:#0a0f1e;">
    <div style="aspect-ratio:16/9;background:#0c1020;border-radius:12px;display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,0.35)">
      <div class="vstack" style="align-items:center;">
        <div style="font-size:54px;">▶</div>
        <div style="color:var(--muted)">Video placeholder — integrate HLS later</div>
      </div>
    </div>
  </div>`;
}

function leaderboard(){
  const rows = allParts().map(p => ({
    id:p.id, title:p.title,
    work: state.works.find(w => w.parts.includes(p))?.title ?? "",
    studio: studioById(state.works.find(w => w.parts.includes(p))?.studioId)?.name ?? "",
    likes:p.likes, views:p.views, score: trendingScore(p)
  })).sort((a,b)=>b.score-a.score).slice(0,50);
  app.innerHTML = `
  <section class="section panel">
    <h2 style="margin-top:0;">Leaderboard</h2>
    <table class="table">
      <thead><tr><th>#</th><th>Work</th><th>Part</th><th>Studio</th><th>Likes</th><th>Views</th><th>Score</th></tr></thead>
      <tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${r.work}</td><td>${r.title}</td><td>${r.studio}</td><td>${r.likes}</td><td>${r.views}</td><td>${r.score}</td></tr>`).join("")}</tbody>
    </table>
  </section>`;
}

function market(){
  const items = state.listings.filter(l=>l.active);
  app.innerHTML = `
  <section class="section vstack">
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
    const w = byId(state.works, l.workId);
    const studio = studioById(w.studioId);
    return `<div class="card">
      <img class="thumb" src="${w.cover}" alt="${w.title} cover"/>
      <div class="content vstack">
        <strong>${l.title}</strong>
        <div style="color:var(--muted);font-size:13px;">by ${studio.name}</div>
        <div style="margin-top:6px;"><span class="badge">${w.kind}</span> ${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")}</div>
        <div class="hstack" style="justify-content:space-between;margin-top:8px;">
          <div><b>${currency(l.priceCents,l.currency)}</b></div>
          <button class="button primary" data-add="${l.id}">Add</button>
        </div>
      </div>
    </div>`;
  }

  function renderCart(){
    const itemsHtml = state.cart.map(ci => {
      const l = byId(state.listings, ci.listingId); if(!l) return "";
      const w = byId(state.works, l.workId);
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
    document.getElementById("totals").innerHTML = `
      <div class="vstack" style="align-items:flex-end;">
        <div>Subtotal: <b>${currency(pb.subtotal)}</b></div>
        <div>Platform fee (1%): <b>${currency(pb.platformFee)}</b></div>
        <div>Payment fee (simulated): <b>${currency(pb.paymentFee)}</b></div>
        <div>Creator payout (after fees): <b>${currency(pb.creatorPayout)}</b></div>
      </div>`;
    document.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", e => {
      removeFromCart(e.currentTarget.getAttribute("data-remove")); renderCart();
    }));
  }
  renderCart();
  document.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", e => { addToCart(e.currentTarget.getAttribute("data-add"),1); renderCart(); }));
  document.getElementById("clearCart").addEventListener("click", ()=>{ state.cart=[]; saveState(); renderCart(); });
  document.getElementById("checkout").addEventListener("click", ()=>{ const r = simulateCheckout(); alert(r.message); renderCart(); });
}

function studio(){
  const mine = state.studios.find(s => s.ownerId===state.me);
  if(!mine){
    app.innerHTML = `
    <section class="section panel vstack">
      <h2>Create Your Studio</h2>
      <label>Name <input id="sName" class="input" placeholder="Studio name"/></label>
      <label>Slug <input id="sSlug" class="input" placeholder="studio-slug"/></label>
      <label>Bio <textarea id="sBio" class="input" rows="3"></textarea></label>
      <div class="hstack">
        <button class="button primary" id="sCreate">Create Studio</button>
        <a class="button ghost" href="#/">Cancel</a>
      </div>
    </section>`;
    document.getElementById("sCreate").addEventListener("click", ()=>{
      const name = document.getElementById("sName").value.trim();
      const slug = document.getElementById("sSlug").value.trim();
      const bio = document.getElementById("sBio").value.trim();
      if(!name||!slug) return alert("Name and slug required.");
      createStudio(name, slug, bio); studio();
    });
    return;
  }
  const works = state.works.filter(w=>w.studioId===mine.id);
  app.innerHTML = `
  <section class="section vstack">
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
        <a class="button primary" href="#/publish">New Work</a>
      </div>
      <div class="grid">${works.map(card).join("")}</div>
    </div>
  </section>`;
}

function publish(){
  const myStudios = state.studios.filter(s=>s.ownerId===state.me);
  app.innerHTML = `
  <section class="section vstack">
    <div class="panel vstack">
      <h2 style="margin-top:0;">Publish a New Work</h2>
      <label>Studio
        <select id="pubStudio" class="input">
          ${myStudios.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}
        </select>
      </label>
      <label>Title <input id="pubTitle" class="input" placeholder="e.g., Foxfire Chronicle"/></label>
      <label>Kind
        <select id="pubKind" class="input">
          <option value="manga">Manga</option>
          <option value="animation">Animation</option>
        </select>
      </label>
      <label>Synopsis <textarea id="pubSynopsis" class="input" rows="3"></textarea></label>
      <label>Tags (comma-separated) <input id="pubTags" class="input" placeholder="shounen, fantasy"/></label>
      <div class="hstack">
        <button class="button primary" id="createWork">Create Work</button>
        <a class="button ghost" href="#/studio">Back to Studio</a>
      </div>
    </div>
    <div id="afterCreate"></div>
  </section>`;

  document.getElementById("createWork").addEventListener("click", () => {
    const studioId = document.getElementById("pubStudio").value;
    const title = document.getElementById("pubTitle").value.trim();
    const kind = document.getElementById("pubKind").value;
    const synopsis = document.getElementById("pubSynopsis").value.trim();
    const tags = document.getElementById("pubTags").value.split(",").map(t=>t.trim()).filter(Boolean);
    if(!title) return alert("Title is required.");
    const w = createWork({ studioId, title, kind, synopsis, tags });
    document.getElementById("afterCreate").innerHTML = partCreator(w);
    bindPartHandlers(w.id);
  });

  function partCreator(w){
    return `<div class="panel vstack" style="margin-top:16px;">
      <h3 style="margin:0;">Add Chapter/Episode</h3>
      <label>Part title <input id="partTitle" class="input" placeholder="Chapter 1"/></label>
      <button class="button" id="addPart">Create Part</button>
      <div id="partArea" style="margin-top:12px;"></div>
    </div>`;
  }
  function bindPartHandlers(workId){
    document.getElementById("addPart").addEventListener("click", () => {
      const title = document.getElementById("partTitle").value.trim() || "Untitled";
      const p = createPart(workId, title);
      const area = document.getElementById("partArea");
      area.innerHTML = `<div class="vstack">
        <h4 style="margin:0;">Upload Pages (PNG/JPG)</h4>
        <input type="file" id="pageFiles" accept="image/*" multiple/>
        <button class="button primary" id="savePages">Save Pages</button>
        <div id="preview" class="grid" style="margin-top:10px;"></div>
        <div class="hstack" style="justify-content:flex-end;margin-top:10px;">
          <a class="button success" href="#/work/${byId(state.works, workId).slug}">View Work →</a>
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
        await addPages(p.id, files);
        alert("Pages saved to localStorage! (Prototype)");
      });
    });
  }
}

// Utility
function bindSearchShortcut(){
  window.addEventListener("keydown", (e)=>{
    if(e.key==="/" && !e.ctrlKey && !e.metaKey){
      e.preventDefault(); location.hash="#/explore";
      setTimeout(()=>document.getElementById("q")?.focus(),30);
    }
  }, { once:true });
}
