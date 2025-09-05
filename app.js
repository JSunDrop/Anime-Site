// Router & Views (includes Creator Profile, Follow, and Office)
const app = document.getElementById("app");
addEventListener("hashchange", render);
addEventListener("load", render);

function route(){
  const hash = location.hash || "#/";
  const [_, path, a, b, c] = hash.split("/");
  return { path, a, b, c };
}
function render(){
  const { path, a, b } = route();
  switch(path){
    case "": return home();
    case "explore": return explore();
    case "work": return workView(a, b);
    case "leaderboard": return leaderboard();
    case "market": return market();
    case "studio": return studio(a, b); // /studio  or  /studio/<slug>/office
    case "publish": return publish();
    case "settings": return settings();
    case "creator": return creator(a);
    default: app.innerHTML = `<div class="panel"><h2>Not Found</h2></div>`;
  }
}

// Landing with "Continue" shelf first
function home(){
  const featured = [...state.works].slice(0, 3);
  const tags = uniqueTags().slice(0, 16);

  app.innerHTML = `
  <section class="hero section">
    <div class="panel soft vstack">
      <h1 class="title">Create. Publish. Collaborate.</h1>
      <p class="subtitle">OtakuHub blends the best of Crunchyroll-style discovery, Amazon-like marketplace, and clean manga/video readers — built for creators and studios, with a <b>1% platform fee</b>.</p>
      <div class="hstack">
        <a class="button primary" href="#/publish">Start Publishing</a>
        <a class="button" href="#/explore">Explore Works</a>
        <a class="button" href="#/studio">Your Studio</a>
      </div>
      <div class="notice">Resume where you left off, manage a Studio with an Office, and collaborate on chapters/episodes together.</div>
    </div>
    <div class="panel vstack">
      <h3 style="margin:0;">Featured</h3>
      <div class="grid">${featured.map(card).join("")}</div>
    </div>
  </section>

  <section class="section panel vstack">
    <h3 style="margin:0;">Continue Reading / Watching</h3>
    <div class="grid">${state.works.map(w => continueCard(w)).join("")}</div>
  </section>

  <section class="section panel vstack">
    <h3 style="margin:0;">Browse by Tag</h3>
    <div class="tagbar" style="margin-bottom:8px">${tags.map(t=>`<a class="badge" href="#/explore?tag=${encodeURIComponent(t)}">#${t}</a>`).join("")}</div>
  </section>
  `;
  bindSearchShortcut();
}

function continueCard(w){
  const prog = getProgress(w.id);
  const parts = partsOfWork(w);
  const start = prog ? parts.find(p=>p.index===prog.partIndex) : parts[0];
  const label = prog ? `Resume ${w.kind==="manga"?"Chapter":"Episode"} ${prog.partIndex}` : `Start ${w.kind==="manga"?"Chapter":"Episode"} 1`;
  const href = `#/work/${w.slug}/part/${start?.index || 1}`;
  return `
    <a class="card" href="${href}" title="${w.title}">
      <img class="thumb" src="${w.cover}" alt="${w.title} cover"/>
      <div class="content">
        <div class="hstack" style="justify-content:space-between;">
          <strong>${w.title}</strong>
          <span class="badge">${w.kind}</span>
        </div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px;">${label}</div>
        <div style="margin-top:6px;">${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")}</div>
      </div>
    </a>`;
}

// Explore with tags and rating filter
function explore(){
  const url = new URL(location.href);
  const tagQuery = url.hash.includes("?tag=") ? decodeURIComponent(url.hash.split("?tag=")[1]) : "";
  const tags = uniqueTags();
  const all = state.works;

  app.innerHTML = `
  <section class="section panel vstack">
    <div class="hstack" style="justify-content:space-between;align-items:center;">
      <h2 style="margin:0;">Explore</h2>
      <input id="q" class="input" placeholder="Search titles or tags (shounen, action, fantasy)"/>
    </div>
    <div class="hstack" style="gap:10px;align-items:center;">
      <div id="tagbar" class="tagbar" style="margin-top:8px;flex:1">
        ${tags.map(t => `<span class="badge tag ${t===tagQuery?'active':''}" data-tag="${t}">#${t}</span>`).join("")}
      </div>
      <select id="ratingFilter" class="input" style="max-width:220px;">
        <option value="">All ratings</option>
        <option value="E">Everyone (E)</option>
        <option value="T">Teen (T)</option>
        <option value="M">Mature (M)</option>
        <option value="X">Explicit (X)</option>
      </select>
    </div>
    <div id="results" class="grid" style="margin-top:12px;">
      ${all.map(card).join("")}
    </div>
  </section>`;

  const q = document.getElementById("q");
  const results = document.getElementById("results");
  const tagbar = document.getElementById("tagbar");
  const ratingFilter = document.getElementById("ratingFilter");
  const activeTags = new Set(tagQuery ? [tagQuery] : []);
  if(tagQuery){ tagbar.querySelectorAll(`[data-tag="${CSS.escape(tagQuery)}"]`).forEach(el => el.classList.add("active")); }

  function rerender(){
    const hits = searchWorks(q.value, Array.from(activeTags), ratingFilter.value || null);
    results.innerHTML = hits.map(card).join("");
  }
  q.addEventListener("input", rerender);
  ratingFilter.addEventListener("change", rerender);
  tagbar.querySelectorAll(".tag").forEach(el => el.addEventListener("click", () => {
    const t = el.getAttribute("data-tag");
    if(activeTags.has(t)){ activeTags.delete(t); el.classList.remove("active"); }
    else { activeTags.add(t); el.classList.add("active"); }
    rerender();
  }));
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
    </a>`;
}

// Work view with sidebar and age gate
function workView(slug, partIndexStr){
  const w = workBySlug(slug);
  if(!w){ app.innerHTML = `<div class="panel"><h2>Work not found</h2></div>`; return; }
  const studio = studioById(w.studioId);
  const parts = partsOfWork(w);
  const startPart = partIndexStr ? parts.find(p=>String(p.index)===String(partIndexStr)) : getStartPart(w);
  const current = startPart || parts[0];
  const currentIdx = parts.findIndex(p => p.id === current.id);
  const next = parts[currentIdx+1] || null;

  const followBtn = `<button class="button" id="followBtn">${isFollowing(studio.id) ? "Following ✓" : "Follow Studio"}</button>`;

  app.innerHTML = `
  <section class="section two-col">
    <div class="vstack">
      <div class="panel vstack">
        <div class="hstack" style="gap:18px;">
          <img src="${w.cover}" style="width:140px;height:186px;border-radius:14px;object-fit:cover"/>
          <div class="vstack" style="gap:6px;flex:1;">
            <h2 style="margin:0;">${w.title} <span class="badge">${w.kind}</span> <span class="badge">Rated: ${w.rating} — ${RATING_LABEL[w.rating]}</span></h2>
            <div class="hstack" style="justify-content:space-between;align-items:center;">
              <div style="color:var(--muted)">by <a href="#/studio/${studio.slug}">${studio.name}</a></div>
              ${followBtn}
            </div>
            <p style="margin-top:6px;">${w.synopsis||""}</p>
            <div>${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")}</div>
            <div class="hstack">
              <a class="button" href="#/work/${w.slug}/part/${parts[0].index}">Start at ${w.kind==="manga"?"Chapter":"Episode"} 1</a>
              <a class="button primary" href="#/work/${w.slug}/part/${current.index}">${getProgress(w.id) ? "Resume" : "Read/Watch"}</a>
            </div>
          </div>
        </div>
      </div>
      <div class="panel vstack" id="viewer"></div>
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

  document.getElementById("followBtn").addEventListener("click", ()=>{ toggleFollow(studio.id); workView(slug, partIndexStr); });

  renderViewer(current);
  function renderViewer(part){
    const gate = requireAgeGate(part) || requireAgeGate(w);
    const container = document.getElementById("viewer");
    if(gate){ container.innerHTML = ageGateUI(w, part); bindAgeGate(w, part); return; }
    markProgress(w.id, part.index, 1);
    const liked = !!state.likes[part.id]; const likeIcon = liked ? "♥" : "♡";
    const meta = `<div class="hstack" style="justify-content:space-between;">
      <div class="hstack" style="gap:8px;">
        <strong>${w.kind==="manga"?"Chapter":"Episode"} ${part.index}:</strong> ${part.title||""}
        <span class="badge">Rated: ${part.rating} — ${RATING_LABEL[part.rating]}</span>
        <span class="badge">${part.likes} likes</span><span class="badge">${part.views} views</span>
      </div>
      <button class="button" data-like="${part.id}">${likeIcon} Like</button>
    </div>`;
    if(w.kind==="manga"){ container.innerHTML = `${meta}${mangaViewer(part)}`; }
    else { container.innerHTML = `${meta}${videoViewer(part)}`; }
    document.querySelectorAll("[data-like]").forEach(b => b.addEventListener("click", () => { toggleLike(part.id); render(); }));
  }
}

function ageGateUI(work, part){
  return `<div class="vstack">
    <h3 style="margin:0;">Age Verification Required</h3>
    <div class="notice">This ${work.kind==="manga"?"chapter":"episode"} is rated <b>${part.rating}</b> (${RATING_LABEL[part.rating]}), above your current setting (<b>${state.settings.minAllowed}</b>).</div>
    <label>Date of Birth <input id="dob" class="input" type="date"/></label>
    <div class="hstack" style="justify-content:flex-end;">
      <button class="button" id="cancelGate">Cancel</button>
      <button class="button primary" id="verifyAge">I am of legal age</button>
    </div>
  </div>`;
}
function bindAgeGate(work, part){
  document.getElementById("cancelGate").addEventListener("click", () => history.back());
  document.getElementById("verifyAge").addEventListener("click", () => {
    const dob = document.getElementById("dob").value || new Date().toISOString().slice(0,10);
    setAgeVerified(dob); location.hash = `#/work/${work.slug}/part/${part.index}`;
  });
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
  const rows = allParts().map(p => ({
    id:p.id, title:p.title,
    work: state.works.find(w => w.parts.includes(p))?.title ?? "",
    studio: studioById(state.works.find(w => w.parts.includes(p))?.studioId)?.name ?? "",
    likes:p.likes, views:p.views, score: trendingScore(p)
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
  document.getElementById("checkout").addEventListener("click", ()=>{ const r = simulateCheckout(); alert(r.message); renderCart(); });
}

// Studio & Office
function studio(slug, subroute){
  if(!slug){
    const mine = state.studios.find(s => s.ownerId===state.me);
    if(!mine){
      app.innerHTML = `<section class="section panel vstack">
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
        const id = "s_"+Math.random().toString(36).slice(2,8);
        state.studios.push({ id, name, slug, bio, ownerId:state.me, members:[state.me], avatar:"assets/placeholder.svg", office:{tasks:[],chat:[]} });
        saveState(); location.hash = "#/studio/"+slug;
      });
      return;
    }
    return studio(mine.slug);
  }

  const s = state.studios.find(x => x.slug === slug);
  if(!s){ app.innerHTML = `<div class="panel"><h2>Studio not found</h2></div>`; return; }

  if(subroute === "office"){ return officeView(s); }

  const works = state.works.filter(w => w.studioId === s.id);
  app.innerHTML = `<section class="section vstack">
    <div class="panel hstack" style="gap:18px;justify-content:space-between;">
      <div class="hstack" style="gap:18px;">
        <img src="${s.avatar}" style="width:96px;height:96px;border-radius:999px;object-fit:cover"/>
        <div class="vstack" style="gap:6px;">
          <h2 style="margin:0;">${s.name}</h2>
          <div class="badge">@${s.slug}</div>
          <p style="color:var(--muted);margin:0;">${s.bio||""}</p>
        </div>
      </div>
      <div class="hstack">
        <a class="button primary" href="#/studio/${s.slug}/office">Open Office →</a>
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

function officeView(s){
  const office = officeFor(s.id);
  const membersList = s.members.map(id => state.users.find(u => u.id===id)?.handle || id).join(", ");
  app.innerHTML = `<section class="section office">
    <div class="panel vstack">
      <div class="hstack" style="justify-content:space-between;">
        <h2 style="margin:0;">${s.name} — Office</h2>
        <a class="button" href="#/studio/${s.slug}">Back to Studio</a>
      </div>
      <div class="notice">Collaborate in real time (prototype). Assign tasks to members, link them to works/parts, and keep design notes in chat.</div>

      <div class="hstack" style="gap:12px; flex-wrap:wrap;">
        <label style="min-width:220px;">Invite member by @handle
          <div class="hstack">
            <input id="inviteHandle" class="input" placeholder="e.g., demo"/>
            <button class="button" id="inviteBtn">Invite</button>
          </div>
        </label>
        <div class="pill">Members: ${membersList || "None"}</div>
      </div>

      <div class="kanban">
        ${["Backlog","In Progress","Review","Done"].map(col => `
          <div class="col">
            <div class="hstack" style="justify-content:space-between;">
              <strong>${col}</strong>
              <button class="button" data-new="${col}">+ Task</button>
            </div>
            <div id="col-${col.replace(/\\s/g,'')}" style="margin-top:8px;"></div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="panel vstack">
      <h3 style="margin:0;">Team Chat / Notes</h3>
      <div id="chat" class="chat"></div>
      <div class="hstack">
        <input id="chatInput" class="input" placeholder="Share notes, links, or storyboards..."/>
        <button class="button primary" id="sendChat">Send</button>
      </div>
    </div>
  </section>`;

  // Render tasks by column
  function renderTasks(){
    ["Backlog","In Progress","Review","Done"].forEach(col => {
      const mount = document.getElementById("col-"+col.replace(/\s/g,''));
      const items = office.tasks.filter(t => t.status===col);
      mount.innerHTML = items.map(t => {
        const workTitle = t.workId ? (state.works.find(w=>w.id===t.workId)?.title || "") : "";
        return `<div class="task">
          <div><b>${t.title}</b></div>
          <div style="color:var(--muted);font-size:12px;">${workTitle ? "Linked to: "+workTitle+(t.partIndex?(" — Part "+t.partIndex):"") : "No link"}</div>
          <div class="hstack" style="margin-top:6px;justify-content:space-between;">
            <div class="badge">Assignee: ${t.assignee || "Unassigned"}</div>
            <select class="input" data-move="${t.id}" style="max-width:160px;">
              ${["Backlog","In Progress","Review","Done"].map(o=>`<option value="${o}" ${o===t.status?'selected':''}>${o}</option>`).join("")}
            </select>
          </div>
        </div>`;
      }).join("");
      mount.querySelectorAll("[data-move]").forEach(sel => {
        sel.addEventListener("change", e => { moveTask(s.id, e.target.getAttribute("data-move"), e.target.value); renderTasks(); });
      });
    });
  }
  renderTasks();

  // New task buttons
  document.querySelectorAll("[data-new]").forEach(btn => btn.addEventListener("click", () => {
    const status = btn.getAttribute("data-new");
    const title = prompt("Task title? (e.g., 'Storyboard Chapter 2')");
    if(!title) return;
    // optional linking
    const workId = prompt("Link to work ID (optional). Known: "+state.works.map(w=>w.id).join(", "));
    const partIndexStr = prompt("Part index (number, optional)");
    addTask(s.id, { title, status, workId: workId || null, partIndex: partIndexStr? Number(partIndexStr): null });
    renderTasks();
  }));

  // Invite
  document.getElementById("inviteBtn").addEventListener("click", () => {
    const handle = document.getElementById("inviteHandle").value.trim();
    if(!handle) return;
    if(!userByHandle(handle)){
      // create a basic user for prototype
      const uid = "u_"+Math.random().toString(36).slice(2,8);
      state.users.push({ id:uid, handle, displayName:handle, avatar:null, badges:[] });
      saveState();
    }
    const ok = addMemberToStudio(s.id, handle);
    if(!ok) alert("Could not invite (check handle).");
    else studio(s.slug, "office");
  });

  // Chat
  function renderChat(){
    const wrap = document.getElementById("chat");
    wrap.innerHTML = office.chat.slice(-200).map(m => {
      const u = state.users.find(u => u.id === m.by);
      return `<div class="msg"><b>@${u?.handle || "user"}</b>: ${m.text}</div>`;
    }).join("");
    wrap.scrollTop = wrap.scrollHeight;
  }
  renderChat();
  document.getElementById("sendChat").addEventListener("click", () => {
    const input = document.getElementById("chatInput"); const t = input.value.trim();
    if(!t) return; addChat(s.id, t); input.value=""; renderChat();
  });
}

// Publish (with rating)
function publish(){
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
    bindPartHandlers(id);
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
  function bindPartHandlers(workId){
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
          <a class="button success" href="#/work/${w.slug}">View Work →</a>
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
        alert("Pages saved to localStorage! (Prototype)");
      });
    });
  }
}

// Settings & Creator profile
function settings(){
  app.innerHTML = `<section class="section panel vstack">
    <h2 style="margin:0;">Settings</h2>
    <div class="hstack" style="flex-wrap:wrap">
      <label style="min-width:260px;">Content maturity threshold
        <select id="minAllowed" class="input">
          <option value="E">Everyone (E)</option>
          <option value="T" ${state.settings.minAllowed==="T"?"selected":""}>Teen (T)</option>
          <option value="M" ${state.settings.minAllowed==="M"?"selected":""}>Mature (M)</option>
          <option value="X" ${state.settings.minAllowed==="X"?"selected":""}>Explicit (X)</option>
        </select>
      </label>
      <label style="min-width:260px;">Date of Birth
        <input id="dob" class="input" type="date" value="${state.settings.dob || ""}"/>
      </label>
    </div>
    <div class="hstack" style="justify-content:flex-end;">
      <button class="button" id="saveSettings">Save</button>
      <button class="button success" id="verify">Verify Age</button>
    </div>
    <div class="notice">Anything rated above your threshold will require age verification. For gore or sexual content (M/X), verification is enforced.</div>
  </section>`;
  document.getElementById("saveSettings").addEventListener("click", () => {
    const v = document.getElementById("minAllowed").value;
    const dob = document.getElementById("dob").value;
    setMinAllowed(v); if(dob) state.settings.dob = dob; saveState(); alert("Saved!");
  });
  document.getElementById("verify").addEventListener("click", () => {
    const dob = document.getElementById("dob").value; if(!dob) return alert("Enter your date of birth first.");
    setAgeVerified(dob); alert("Age verified (prototype).");
  });
}

function creator(handle){
  const u = userByHandle(handle) || state.users[0];
  const myWorks = state.works.filter(w => state.studios.find(s=>s.id===w.studioId)?.ownerId === u.id);
  app.innerHTML = `<section class="section vstack">
    <div class="panel hstack" style="gap:18px;">
      <img src="${u.avatar || 'assets/placeholder.svg'}" style="width:96px;height:96px;border-radius:999px;object-fit:cover"/>
      <div class="vstack" style="gap:6px;">
        <h2 style="margin:0;">${u.displayName} <span class="badge">@${u.handle}</span></h2>
        <p style="color:var(--muted);margin:0;">${u.bio || "Creator"}</p>
        <div class="hstack">${(u.badges||[]).map(b => `<span class="badge">${b}</span>`).join("")}</div>
      </div>
    </div>
    <div class="panel vstack">
      <h3 style="margin:0;">Works</h3>
      <div class="grid">${myWorks.map(card).join("")}</div>
    </div>
  </section>`;
}

// Utilities
function bindSearchShortcut(){
  addEventListener("keydown", (e)=>{
    if(e.key==="/" && !e.ctrlKey && !e.metaKey){
      e.preventDefault(); location.hash="#/explore";
      setTimeout(()=>document.getElementById("q")?.focus(),30);
    }
  }, { once:true });
}
