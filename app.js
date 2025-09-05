// Router & views — classic layout
const app=document.getElementById('app'); addEventListener('hashchange',render); addEventListener('load',render);
function route(){const h=location.hash||"#/home";const [_,path,a,b]=h.split("/");return {path,a,b}}
function render(){ const {path,a,b}=route(); switch(path){
  case "home": return home();
  case "explore": return explore();
  case "leaderboard": return leaderboard();
  case "market": return market();
  case "studio": return studio();
  case "discover": return discover();
  case "forum": return forum();
  case "live": return live();
  case "publish": return publish();
  case "work": return workView(a,b);
  case "policy": return policy();
  default: return home();
}}

// Toasts
function renderToasts(){ const wrap=document.getElementById("toast"); wrap.innerHTML = state.notifications.map(n=>`<div class="toast">${n.text}</div>`).join(""); setTimeout(()=>{ state.notifications.shift(); wrap.innerHTML=""; }, 2200) }

// Onboarding — profile + DOB (age verification happens here only)
function ensureOnboarded(){
  if(state.account?.dob && state.account?.handle) return true;
  app.innerHTML = `<section class="panel vstack">
    <h2 style="margin:0;">Create Your Profile</h2>
    <p class="notice">Your date of birth is used to enforce content age restrictions (E/T/M/X). Stored locally in this prototype.</p>
    <label>Handle <input id="handle" class="input" placeholder="yourname"/></label>
    <label>Display name <input id="display" class="input" placeholder="Your Name"/></label>
    <label>Date of Birth <input id="dob" class="input" type="date"/></label>
    <div class="hstack" style="justify-content:flex-end;"><button class="button primary" id="save">Save</button></div>
  </section>`;
  document.getElementById("save").onclick = ()=>{
    const h=document.getElementById("handle").value.trim(); const d=document.getElementById("display").value.trim(); const dob=document.getElementById("dob").value;
    if(!h||!dob) return alert("Handle and DOB are required.");
    state.account.handle=h; state.account.displayName=d||h; state.account.dob=dob; save(); location.hash="#/home";
  };
  return false;
}

// ---------- HOME ----------
function home(){
  if(!ensureOnboarded()) return;
  const featured=state.works.slice(0,3);
  const resume=state.works.slice(0,4);
  const tags=uniqueTags();
  app.innerHTML = `
  <section class="hero section">
    <div class="panel vstack">
      <h1 class="title">Create. Publish. Collaborate.</h1>
      <p class="subtitle">OtakuHub blends clean manga/video readers with Studio tools — and a fair <b>1% platform fee</b>.</p>
      <div class="hstack"><a class="button primary" href="#/publish">Start Publishing</a><a class="button" href="#/explore">Explore Works</a><a class="button" href="#/studio">Your Studio</a></div>
      <div class="notice">Resume where you left off, manage a Studio Office, and collaborate on chapters/episodes together.</div>
    </div>
    <div class="panel vstack">
      <h3 style="margin:0;">Featured</h3>
      <div class="grid">${featured.map(card).join("")}</div>
    </div>
  </section>

  <section class="panel vstack">
    <h3 style="margin:0;">Continue Reading / Watching</h3>
    <div class="grid">${resume.map(card).join("")}</div>
  </section>

  <section class="panel vstack">
    <h3 style="margin:0;">Browse by Tag</h3>
    <div class="hstack">${tags.map(t=>`<a class="badge" href="#/explore#${t}">#${t}</a>`).join("")}</div>
  </section>`;
}

function card(w){
  const studio = studioById(w.studioId); const locked=isLockedWork(w); const fav = state.favorites.includes(w.id);
  return `<div class="card ${locked?'locked':''}">
    <a href="${locked?'#//blocked':('#/work/'+w.slug)}" ${locked?'onclick="event.preventDefault();alert(\\'Age restriction: '+RATING_LABEL[w.rating]+'\\')"' : ''}>
      <img class="thumb" src="${w.cover}" alt="${w.title} cover"/>
    </a>
    <div class="content">
      <div class="hstack" style="justify-content:space-between;">
        <a href="${locked?'#//blocked':('#/work/'+w.slug)}"><strong>${w.title}</strong></a>
        <span class="badge">${w.kind}</span>
      </div>
      <div style="font-size:13px;color:var(--muted);margin-top:4px;">by ${studio?.name||'Unknown'}</div>
      <div style="margin-top:6px;">${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")} <span class="badge">Rated ${w.rating}</span></div>
      <div class="hstack" style="justify-content:flex-end;margin-top:6px;"><button class="button" data-fav="${w.id}">${fav?'★ Favorited':'☆ Favorite'}</button></div>
    </div>
  </div>`;
}

// ---------- EXPLORE ----------
function explore(){
  if(!ensureOnboarded()) return;
  const tags=uniqueTags(); const hashTag=decodeURIComponent((location.hash.split('#')[2]||"")).replace(/^#/,''); const active=new Set(hashTag?[hashTag]:[]);
  app.innerHTML = `<section class="panel vstack">
    <div class="hstack" style="justify-content:space-between;">
      <h2 style="margin:0;">Explore</h2>
      <div class="hstack"><input id="q" class="input" placeholder="Search titles or tags"/><select id="sort" class="input" style="max-width:200px;">
        <option value="trending">Trending</option><option value="new">Newest</option><option value="top">Top liked</option></select></div>
    </div>
    <div id="tagbar" class="hstack" style="flex-wrap:wrap;margin-top:8px;">${tags.map(t=>`<span class="badge tag ${active.has(t)?'active':''}" data-tag="${t}">#${t}</span>`).join("")}</div>
    <div id="results" class="grid" style="margin-top:12px;">${state.works.map(card).join("")}</div>
  </section>`;
  const q=document.getElementById("q"); const sortSel=document.getElementById("sort"); const results=document.getElementById("results");
  function rerender(){ const hits=searchWorks(q.value, Array.from(active)); const sorted=sortWorks(hits, sortSel.value); results.innerHTML=sorted.map(card).join("") }
  q.oninput=rerender; sortSel.onchange=rerender;
  document.querySelectorAll(".tag").forEach(el=>el.onclick=()=>{ const t=el.getAttribute("data-tag"); if(active.has(t)){active.delete(t);el.classList.remove("active")} else {active.add(t);el.classList.add("active")} rerender() });
}

// ---------- DISCOVER (Search & Recs; no DOB here) ----------
function discover(){
  if(!ensureOnboarded()) return;
  const tags=uniqueTags(); const recs=recommend();
  app.innerHTML = `<section class="vstack">
    <div class="panel vstack">
      <h2 style="margin:0;">Search & Recommendations</h2>
      <div class="hstack" style="gap:8px"><input id="q" class="input" placeholder="Search titles or tags"/><button class="button" id="run">Search</button></div>
      <div id="tagbar" class="hstack" style="flex-wrap:wrap;margin-top:8px;">${tags.map(t=>`<span class="badge tag" data-tag="${t}">#${t}</span>`).join("")}</div>
      <div id="results" class="grid" style="margin-top:12px;"></div>
    </div>
    <div class="panel vstack">
      <h3 style="margin:0;">Recommended for You</h3>
      <div class="grid">${recs.map(card).join("")}</div>
    </div>
  </section>`;
  const q=document.getElementById("q"); const results=document.getElementById("results"); const active=new Set();
  document.querySelectorAll(".tag").forEach(el=>el.onclick=()=>{ const t=el.getAttribute("data-tag"); if(active.has(t)){active.delete(t);el.classList.remove("active")} else {active.add(t);el.classList.add("active")} });
  document.getElementById("run").onclick=()=>{ const hits=searchWorks(q.value, Array.from(active)); results.innerHTML=hits.map(card).join("") };
}

// ---------- WORK (with comments + next) ----------
function workView(slug, partPath){
  if(!ensureOnboarded()) return;
  const w=workBySlug(slug); if(!w){ app.innerHTML=`<div class="panel"><h2>Work not found</h2></div>`; return }
  if(isLockedWork(w)){ app.innerHTML = `<section class="panel vstack"><h2>Age Restricted</h2><div class="lock">This work is rated <b>${w.rating}</b> (${RATING_LABEL[w.rating]}). Your age (${userAge()}) does not meet the requirement.</div></section>`; return }
  const parts=partsOfWork(w);
  const prog=getProgress(w.id); const start=prog ? parts.find(p=>p.index===prog.partIndex) : parts[0];
  const requested = partPath && partPath.startsWith("part") ? parts.find(p=>p.index===Number(partPath.split("part/")[1])) : null;
  const current = requested || start || parts[0]; const idx=parts.findIndex(p=>p.id===current.id); const next=parts[idx+1]||null;
  const studio=studioById(w.studioId); const fav=state.favorites.includes(w.id);

  app.innerHTML = `<section class="two-col">
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
              <div class="hstack"><a class="button" href="#/work/${w.slug}/part/${parts[0].index}">Start at ${w.kind==='manga'?'Chapter':'Episode'} 1</a><a class="button primary" href="#/work/${w.slug}/part/${current.index}">${prog?'Resume':'Read/Watch'}</a><button class="button" id="favBtn">${fav?'★ Favorited':'☆ Favorite'}</button></div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel vstack" id="viewer"></div>
      <div class="panel vstack" id="comments"><h3 style="margin:0;">Comments</h3><div id="commentList"></div><div class="hstack"><input id="commentText" class="input" placeholder="Share your thoughts"/><button class="button primary" id="sendComment">Post</button></div></div>
      ${next?`<div class="panel hstack" style="justify-content:space-between;"><div>Up Next: <b>${w.kind==='manga'?'Chapter':'Episode'} ${next.index}</b> — ${next.title||''}</div><a class="button primary" href="#/work/${w.slug}/part/${next.index}">Next →</a></div>`:''}
    </div>
    <aside class="sidebar vstack"><div class="panel vstack"><h3 style="margin:0;">${w.kind==='manga'?'Chapters':'Episodes'}</h3>
      ${parts.map(p=>`<a class="hstack" href="#/work/${w.slug}/part/${p.index}" style="justify-content:space-between;padding:8px;border-bottom:1px solid #223154;"><div>${w.kind==='manga'?'Ch.':'Ep.'} ${p.index}: ${p.title||''}</div><div class="hstack"><span class="badge">${p.likes} ❤</span><span class="badge">${p.views} 👁</span></div></a>`).join("")}
    </div></aside>
  </section>`;
  document.getElementById("favBtn").onclick=()=>{ toggleFavorite(w.id); workView(slug, partPath); };

  function renderViewer(part){
    if(isLockedPart(part)){ document.getElementById("viewer").innerHTML = `<div class="lock">This ${w.kind==='manga'?'chapter':'episode'} is rated <b>${part.rating}</b> (${RATING_LABEL[part.rating]}). Age ${RATING_MIN_AGE[part.rating]}+ required.</div>`; return }
    markProgress(w.id, part.index, 1);
    const liked=!!state.likes[part.id]; const likeIcon = liked? "♥":"♡";
    const meta = `<div class="hstack" style="justify-content:space-between;">
      <div class="hstack" style="gap:8px;"><strong>${w.kind==='manga'?'Chapter':'Episode'} ${part.index}:</strong> ${part.title||''} <span class="badge">Rated ${part.rating}</span> <span class="badge">${part.likes} likes</span> <span class="badge">${part.views} views</span></div>
      <button class="button" data-like="${part.id}">${likeIcon} Like</button>
    </div>`;
    const content = w.kind==='manga' ? mangaViewer(part) : videoViewer(part);
    document.getElementById("viewer").innerHTML = meta + content;
    document.querySelectorAll("[data-like]").forEach(b => b.onclick=()=>{ toggleLike(part.id); render() });
  }
  renderViewer(current);

  // Comments
  function renderComments(){ const list=document.getElementById("commentList"); const items=commentsFor("work", w.id);
    list.innerHTML = items.map(c=>{ const u=userById(c.by); return `<div class="comment"><b>@${u?.handle||'user'}</b> — <span style="color:var(--muted)">${new Date(c.at).toLocaleString()}</span><br/>${c.text}</div>` }).join("") || `<div style="color:var(--muted)">No comments yet. Be first!</div>`;
  }
  renderComments();
  document.getElementById("sendComment").onclick=()=>{ const t=document.getElementById("commentText"); const txt=t.value.trim(); if(!txt) return; addComment("work", w.id, txt); t.value=""; renderComments() };
}

function mangaViewer(part){ const pages=part.pages.sort((a,b)=>a.pageNum-b.pageNum); return `<div class="vstack" style="gap:8px;margin-top:8px;">${pages.map(pg=>`<img src="${pg.imageUrl}" class="thumb" style="max-width:900px;margin:0 auto;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.35)" alt="page ${pg.pageNum}"/>`).join("")}</div>` }
function videoViewer(part){ return `<div class="panel" style="background:#0a0f1e;margin-top:8px;"><div style="aspect-ratio:16/9;background:#0c1020;border-radius:12px;display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,.35)"><div class="vstack" style="align-items:center;"><div style="font-size:54px;">▶</div><div style="color:var(--muted)">Video placeholder — integrate HLS later</div></div></div></div>` }

// ---------- LEADERBOARD ----------
function leaderboard(){
  if(!ensureOnboarded()) return;
  const rows = state.works.flatMap(w=>w.parts.map(p=>({p, w, score:(p.likes*2)+Math.floor(p.views/10)}))).sort((a,b)=>b.score-a.score);
  app.innerHTML = `<section class="panel vstack"><h2 style="margin:0;">Leaderboard</h2><div class="grid">${rows.slice(0,12).map(({w,p,score})=>`
    <div class="card"><div class="content"><b>${w.title}</b><div style="color:var(--muted)">Part ${p.index}: ${p.title||''}</div>
      <div class="hstack"><span class="badge">${p.likes} ❤</span><span class="badge">${p.views} 👁</span><span class="badge">Score ${score}</span></div></div></div>`).join("")}</div></section>`;
}

// ---------- MARKET ----------
function market(){
  if(!ensureOnboarded()) return;
  const items=state.listings.filter(l=>l.active);
  app.innerHTML = `<section class="vstack">
    <div class="panel vstack"><h2 style="margin:0;">Shop</h2><div class="grid">${items.map(itemCard).join("")}</div></div>
    <div class="panel vstack"><div class="hstack" style="justify-content:space-between;"><h3 style="margin:0;">Cart</h3><button class="button" id="clear">Clear</button></div><div id="cartList"></div><div id="totals" style="text-align:right"></div><div style="text-align:right"><button class="button primary" id="checkout">Checkout (Simulated)</button></div></div>
  </section>`;
  function itemCard(l){ const w=state.works.find(x=>x.id===l.workId); const studio=studioById(w.studioId); const locked=isLockedWork(w);
    return `<div class="card"><img class="thumb" src="${w.cover}"/><div class="content vstack"><b>${l.title}</b><div style="color:var(--muted);font-size:13px;">by ${studio.name}</div><div><span class="badge">${w.kind}</span>${(w.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join(" ")}<span class="badge">Rated ${w.rating}</span></div><div class="hstack" style="justify-content:space-between;margin-top:8px;"><div><b>${currency(l.priceCents,l.currency)}</b></div>${locked?'<span class="badge">Locked</span>':`<button class="button primary" data-add="${l.id}">Add</button>`}</div></div></div>` }
  function renderCart(){ const list=document.getElementById("cartList"); list.innerHTML = state.cart.map(ci=>{ const l=state.listings.find(x=>x.id===ci.listingId); const w=state.works.find(x=>x.id===l.workId); return `<div class="hstack" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid #223154;"><div class="hstack" style="gap:10px;"><img src="${w.cover}" style="width:44px;height:60px;border-radius:8px;object-fit:cover"/><div><div><b>${l.title}</b></div><div style="color:var(--muted);font-size:13px;">Qty: ${ci.qty}</div></div></div><div class="hstack" style="gap:8px;"><div>${currency(l.priceCents*ci.qty,l.currency)}</div><button class="button" data-remove="${ci.listingId}">✕</button></div></div>` }).join("") || `<div style="color:var(--muted)">Your cart is empty.</div>`;
    const pb=priceBreakdown(); document.getElementById("totals").innerHTML = `Subtotal: <b>${currency(pb.subtotal)}</b> · Platform fee (1%): <b>${currency(pb.platformFee)}</b> · Payment fee: <b>${currency(pb.paymentFee)}</b> · Creator payout: <b>${currency(pb.creatorPayout)}</b>`;
    document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{ removeFromCart(b.getAttribute("data-remove")); renderCart() });
  }
  renderCart(); document.getElementById("clear").onclick=()=>{state.cart=[];save();renderCart()};
  document.getElementById("checkout").onclick=()=>{ state.cart=[]; save(); notify("Checkout complete! (simulation)"); renderCart() };
  document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{ addToCart(b.getAttribute("data-add"),1); renderCart() });
}

// ---------- STUDIO (simple) ----------
function studio(){
  if(!ensureOnboarded()) return;
  const mine=state.studios.find(s=>s.ownerId===state.account.userId);
  if(!mine){ app.innerHTML = `<section class="panel vstack"><h2>Create Your Studio</h2><label>Name <input id="sName" class="input"/></label><label>Slug <input id="sSlug" class="input"/></label><label>Bio <textarea id="sBio" class="input" rows="3"></textarea></label><div class="hstack"><button class="button primary" id="create">Create Studio</button><a class="button" href="#/home">Cancel</a></div></section>`; document.getElementById("create").onclick=()=>{ const name=document.getElementById("sName").value.trim(); const slug=document.getElementById("sSlug").value.trim(); const bio=document.getElementById("sBio").value.trim(); if(!name||!slug) return alert("Name and slug required."); const id=newId("s"); state.studios.push({id,name,slug,bio,ownerId:state.account.userId,members:[state.account.userId],avatar:"assets/placeholder.svg",office:{tasks:[],chat:[]}}); save(); location.hash="#/studio" }; return }
  const works=state.works.filter(w=>w.studioId===mine.id);
  app.innerHTML = `<section class="vstack"><div class="panel hstack" style="gap:18px;"><img src="${mine.avatar}" style="width:96px;height:96px;border-radius:999px;object-fit:cover"/><div class="vstack"><h2 style="margin:0;">${mine.name}</h2><div class="badge">@${mine.slug}</div><p style="color:var(--muted);margin:0;">${mine.bio||""}</p></div></div><div class="panel vstack"><div class="hstack" style="justify-content:space-between;"><h3 style="margin:0;">Works</h3><a class="button" href="#/publish">New Work</a></div><div class="grid">${works.map(card).join("")}</div></div></section>`;
}

// ---------- PUBLISH ----------
function publish(){
  if(!ensureOnboarded()) return;
  const myStudios=state.studios.filter(s=>s.ownerId===state.account.userId);
  app.innerHTML = `<section class="panel vstack"><h2 style="margin-top:0;">Publish a New Work</h2><label>Studio <select id="studio" class="input">${myStudios.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}</select></label><label>Title <input id="title" class="input" placeholder="e.g., Foxfire Chronicle"/></label><label>Kind <select id="kind" class="input"><option value="manga">Manga</option><option value="animation">Animation</option></select></label><label>Rating <select id="rating" class="input"><option value="E">Everyone (E)</option><option value="T" selected>Teen (T)</option><option value="M">Mature (M)</option><option value="X">Explicit (X)</option></select></label><label>Synopsis <textarea id="syn" class="input" rows="3"></textarea></label><label>Tags (comma-separated) <input id="tags" class="input" placeholder="shounen, fantasy"/></label><div class="hstack"><button class="button primary" id="create">Create Work</button><a class="button" href="#/studio">Back to Studio</a></div></section><div id="after"></div>`;
  document.getElementById("create").onclick=()=>{
    const studioId=document.getElementById("studio").value; const title=document.getElementById("title").value.trim(); const kind=document.getElementById("kind").value; const rating=document.getElementById("rating").value; const synopsis=document.getElementById("syn").value.trim(); const tags=document.getElementById("tags").value.split(",").map(t=>t.trim()).filter(Boolean); if(!title) return alert("Title is required.");
    const id=newId("w"); const slug=title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); state.works.unshift({id,studioId,kind,title,slug,synopsis,tags,rating,cover:"assets/placeholder.svg",createdAt:now(),parts:[]}); save();
    document.getElementById("after").innerHTML = `<section class="panel vstack"><h3 style="margin:0;">Add ${kind==='manga'?'Chapter':'Episode'}</h3><label>Title <input id="ptitle" class="input" placeholder="${kind==='manga'?'Chapter':'Episode'} 1"/></label><label>Rating <select id="prating" class="input"><option value="E">Everyone (E)</option><option value="T" selected>Teen (T)</option><option value="M">Mature (M)</option><option value="X">Explicit (X)</option></select></label><button class="button" id="add">Create</button><div id="up" style="margin-top:12px;"></div></section>`;
    document.getElementById("add").onclick=()=>{
      const ptitle=document.getElementById("ptitle").value.trim()||"Untitled"; const prating=document.getElementById("prating").value;
      const w=state.works.find(w=>w.id===id); const nextIndex=(w.parts.map(p=>p.index).sort((a,b)=>b-a)[0]||0)+1; const pid=newId("p"); const part={id:pid,index:nextIndex,title:ptitle,rating:prating,public:true,publishedAt:now(),pages:[],video:null,likes:0,views:0}; w.parts.push(part); save();
      const up=document.getElementById("up"); up.innerHTML = `<div class="vstack"><h4 style="margin:0;">Upload Pages</h4><input type="file" id="files" accept="image/*" multiple/><button class="button primary" id="savep">Save Pages</button><div id="preview" class="grid" style="margin-top:10px;"></div><div style="text-align:right;margin-top:10px;"><a class="button" href="#/work/${slug}">View Work →</a></div></div>`;
      const fileInput=document.getElementById("files"); const preview=document.getElementById("preview");
      fileInput.onchange=()=>{ preview.innerHTML=""; for(const f of fileInput.files){ const url=URL.createObjectURL(f); const img=document.createElement("img"); img.src=url; img.className="thumb"; img.style.borderRadius="12px"; preview.appendChild(img) } };
      document.getElementById("savep").onclick=async()=>{ const files=fileInput.files; if(!files?.length) return alert("Choose image files first."); for(const file of files){ const data=await fileToDataURL(file); part.pages.push({id:newId('pg'),pageNum:part.pages.length+1,imageUrl:data}) } save(); notify("Pages saved to localStorage! (Prototype)") };
    };
  };
}
function fileToDataURL(file){ return new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file) }) }

// ---------- FORUM ----------
function forum(){
  if(!ensureOnboarded()) return;
  const cats=state.forum.categories; const threads=state.forum.threads;
  app.innerHTML = `<section class="vstack">
    <div class="panel vstack"><h2 style="margin:0;">Forum</h2><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));">${cats.map(c=>`<div class="panel"><h3 style="margin:0;">${c.name}</h3><p class="subtitle">${c.description}</p></div>`).join("")}</div></div>
    <div class="panel vstack"><div class="hstack" style="justify-content:space-between;"><h3 style="margin:0;">Latest Threads</h3><button class="button" id="new">+ New Thread</button></div><div id="list"></div></div>
  </section>`;
  function renderList(){ document.getElementById("list").innerHTML = threads.map(t=>{ const c=cats.find(x=>x.id===t.categoryId); const first=t.posts[0]; const author=userById(first.by); return `<div class="vstack" style="gap:4px;padding:10px;border-bottom:1px solid #223154;"><div class="hstack" style="justify-content:space-between;"><div><b>[${c?.name}]</b> ${t.title}</div><a class="button" href="#/forum/${t.id}">Open</a></div><div style="color:var(--muted);font-size:13px;">by @${author?.handle||'user'} — ${new Date(first.at).toLocaleString()}</div></div>` }).join(""); document.querySelectorAll('a[href^="#/forum/"]').forEach(a=>a.onclick=(e)=>{ e.preventDefault(); threadView(a.getAttribute("href").split("/")[2]) }) }
  renderList();
  document.getElementById("new").onclick=()=>{ const cat=prompt("Category (general, help, feedback, showcase)?")||"general"; const map={general:"c_general",help:"c_help",feedback:"c_feedback",showcase:"c_showcase"}; const categoryId=map[cat.toLowerCase()]||"c_general"; const title=prompt("Thread title:"); const text=prompt("First post:"); if(!title||!text) return; const th={id:newId("t"),categoryId,title,authorId:state.account.userId,at:now(),posts:[{id:newId('po'),by:state.account.userId,at:now(),text}]}; state.forum.threads.unshift(th); save(); renderList() };
}
function threadView(id){
  const t=state.forum.threads.find(x=>x.id===id); if(!t){ alert("Thread not found."); return forum() }
  app.innerHTML = `<section class="panel vstack"><div class="hstack" style="justify-content:space-between;"><h2 style="margin:0;">${t.title}</h2><a class="button" href="#/forum">Back</a></div><div class="vstack" id="posts"></div><div class="hstack"><input id="txt" class="input" placeholder="Reply..."/><button class="button primary" id="send">Reply</button></div></section>`;
  function renderPosts(){ document.getElementById("posts").innerHTML = t.posts.map(p=>{ const u=userById(p.by); return `<div class="comment"><b>@${u?.handle||'user'}</b> — <span style="color:var(--muted)">${new Date(p.at).toLocaleString()}</span><br/>${p.text}</div>` }).join("") }
  renderPosts(); document.getElementById("send").onclick=()=>{ const txt=document.getElementById("txt").value.trim(); if(!txt) return; t.posts.push({id:newId('po'),by:state.account.userId,at:now(),text:txt}); save(); renderPosts(); document.getElementById("txt").value="" };
}

// ---------- LIVE ----------
let liveTimer=null;
function live(){
  if(!ensureOnboarded()) return;
  app.innerHTML = `<section class="panel vstack"><h2 style="margin:0;">Live Chat — General</h2><div id="box" style="max-height:420px;overflow:auto;display:flex;flex-direction:column;gap:8px;border:1px solid #1f2947;border-radius:12px;padding:12px"></div><div class="hstack"><input id="text" class="input" placeholder="Say something..."/><button class="button primary" id="send">Send</button></div></section>`;
  function renderLive(){ const msgs=liveMessages(); const box=document.getElementById("box"); box.innerHTML = msgs.slice(-200).map(m=>{ const u=userById(m.by); return `<div class="msg"><b>@${u?.handle||'user'}</b> — ${new Date(m.at).toLocaleTimeString()}<br/>${m.text}</div>` }).join(""); box.scrollTop=box.scrollHeight }
  renderLive(); document.getElementById("send").onclick=()=>{ const t=document.getElementById("text"); const txt=t.value.trim(); if(!txt) return; sendLive(txt); t.value=""; renderLive() }; if(liveTimer) clearInterval(liveTimer); liveTimer=setInterval(renderLive,2000);
}

// ---------- POLICY ----------
function policy(){ app.innerHTML = `<section class="panel vstack"><h2 style="margin:0;">Community Guidelines</h2><p>Respect others. Don’t post illegal content. Label mature works appropriately. Report issues from any work page.</p><p>Ratings: E (0+), T (13+), M (17+), X (18+).</p></section>` }