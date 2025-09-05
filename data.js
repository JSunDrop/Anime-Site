// State with creator profiles, follow, office, ratings, progress
const STORAGE_KEY = "otakuhub_grande_pro_collab_v1";
const now = () => new Date().toISOString();
const RATINGS = ["E","T","M","X"];
const RATING_LABEL = { E:"Everyone", T:"Teen (13+)", M:"Mature (17+)", X:"Explicit (18+)" };

const initialState = {
  users: [
    { id:"u_demo", handle:"demo", displayName:"Demo User", avatar:null, bio:"Explorer of worlds.",
      badges:["First Upload","100 Likes (demo)"] }
  ],
  settings: { minAllowed:"T", ageVerified:false, dob:null },
  studios: [
    { id:"s_oni", name:"OniWorks", slug:"oniworks", bio:"Indie anime studio.", ownerId:"u_demo",
      members:["u_demo"], avatar:"assets/placeholder.svg",
      office:{ tasks:[], chat:[] } },
    { id:"s_mako", name:"Mako Reactor", slug:"mako-reactor", bio:"Sci-fi synth vibes.", ownerId:"u_demo",
      members:["u_demo"], avatar:"assets/placeholder.svg",
      office:{ tasks:[], chat:[] } }
  ],
  works: [
    { id:"w_blade", studioId:"s_oni", kind:"manga", title:"Blade of Dawn", slug:"blade-of-dawn",
      synopsis:"A young swordsman seeks the sun blade.", tags:["shounen","adventure","fantasy"],
      rating:"T", cover:"assets/placeholder.svg", createdAt:now(),
      parts:[{ id:"p_blade_1", index:1, title:"Chapter 1: Ember", rating:"T", public:true, publishedAt:now(),
               pages:[{id:"pg1", pageNum:1, imageUrl:"assets/placeholder.svg"},
                      {id:"pg2", pageNum:2, imageUrl:"assets/placeholder.svg"}], video:null, likes:25, views:402 }]},
    { id:"w_spark", studioId:"s_oni", kind:"animation", title:"Spark Runner", slug:"spark-runner",
      synopsis:"Courier races through neon cityscapes.", tags:["sci-fi","action","neon"],
      rating:"T", cover:"assets/placeholder.svg", createdAt:now(),
      parts:[{ id:"p_spark_ep1", index:1, title:"Episode 1: Night Shift", rating:"T", public:true, publishedAt:now(),
               pages:[], video:{posterUrl:"assets/placeholder.svg"}, likes:17, views:180 }]},
    { id:"w_azure", studioId:"s_mako", kind:"manga", title:"Azure Lullaby", slug:"azure-lullaby",
      synopsis:"Dream-divers rescue melodies from a flooded city.", tags:["drama","music","fantasy"],
      rating:"M", cover:"assets/placeholder.svg", createdAt:now(),
      parts:[{ id:"p_azure_1", index:1, title:"Chapter 1: Undertow", rating:"M", public:true, publishedAt:now(),
               pages:[{id:"pg1", pageNum:1, imageUrl:"assets/placeholder.svg"}], video:null, likes:36, views:520 }]},
    { id:"w_rail", studioId:"s_mako", kind:"animation", title:"Railgun Waltz", slug:"railgun-waltz",
      synopsis:"A conductor who dances with lightning.", tags:["action","fantasy","steampunk"],
      rating:"E", cover:"assets/placeholder.svg", createdAt:now(),
      parts:[{ id:"p_rail_1", index:1, title:"Episode 1: Overture", rating:"E", public:true, publishedAt:now(),
               pages:[], video:{posterUrl:"assets/placeholder.svg"}, likes:29, views:610 }]}
  ],
  listings: [
    { id:"l1", workId:"w_blade", title:"Blade of Dawn — Digital Vol.1 (PDF)", priceCents:700, currency:"USD", stock:null, active:true, sellerStudioId:"s_oni" },
    { id:"l2", workId:"w_spark", title:"Spark Runner — Early Access", priceCents:400, currency:"USD", stock:null, active:true, sellerStudioId:"s_oni" },
    { id:"l3", workId:"w_azure", title:"Azure Lullaby — OST (FLAC)", priceCents:500, currency:"USD", stock:null, active:true, sellerStudioId:"s_mako" },
    { id:"l4", workId:"w_rail", title:"Railgun Waltz — Poster Pack", priceCents:300, currency:"USD", stock:null, active:true, sellerStudioId:"s_mako" }
  ],
  likes:{}, cart:[], me:"u_demo",
  followedStudios:[], // array of studioIds
  progress:{},       // workId -> { partIndex, pageNum }
};

function loadState(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState; } catch(e){ return initialState; } }
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
let state = loadState();

// Helpers
const byId = (arr, id) => arr.find(x => x.id === id);
const workBySlug = slug => state.works.find(w => w.slug === slug);
const studioById = id => byId(state.studios, id);
const userByHandle = h => state.users.find(u => u.handle === h);
const partsOfWork = w => w.parts.filter(p=>p.public).sort((a,b)=>a.index-b.index);
const currency = (cents, curr="USD") => new Intl.NumberFormat(undefined, { style:'currency', currency: curr }).format(cents/100);

function allParts(){ return state.works.flatMap(w => w.parts); }
function toggleLike(partId){ state.likes[partId] = !state.likes[partId]; const p = allParts().find(p => p.id === partId); if(p) p.likes = Math.max(0, p.likes + (state.likes[partId] ? 1 : -1)); saveState(); }
function uniqueTags(){ const s = new Set(); for(const w of state.works){ (w.tags||[]).forEach(t => s.add(t)); } return Array.from(s).sort(); }

// Follow studios
function isFollowing(studioId){ return state.followedStudios.includes(studioId); }
function toggleFollow(studioId){
  if(isFollowing(studioId)) state.followedStudios = state.followedStudios.filter(id => id !== studioId);
  else state.followedStudios.push(studioId);
  saveState();
}

// Ratings & Age Gate
function ratingLevel(code){ return RATINGS.indexOf(code); }
function isAboveThreshold(code){ return ratingLevel(code) > ratingLevel(state.settings.minAllowed); }
function requireAgeGate(workOrPart){
  const code = workOrPart.rating || "E";
  if(!isAboveThreshold(code)) return false;
  return !state.settings.ageVerified;
}
function setAgeVerified(dobISO){ state.settings.ageVerified = true; state.settings.dob = dobISO || state.settings.dob; saveState(); }
function setMinAllowed(code){ if(RATINGS.includes(code)) { state.settings.minAllowed = code; saveState(); } }

// Progress
function markProgress(workId, partIndex, pageNum){ state.progress[workId] = { partIndex, pageNum: pageNum || 1 }; saveState(); }
function getProgress(workId){ return state.progress[workId] || null; }
function getStartPart(work){
  const parts = partsOfWork(work); const prog = getProgress(work.id);
  if(prog){ return parts.find(p => p.index === prog.partIndex) || parts[0]; }
  return parts[0];
}

// Search & Filters
function searchWorks(q, tags=[], ratingFilter=null){
  q = (q||"").trim().toLowerCase();
  const tagset = new Set(tags);
  return state.works.filter(w => {
    const qhit = !q || w.title.toLowerCase().includes(q) || (w.tags||[]).join(" ").toLowerCase().includes(q);
    const thit = tagset.size===0 || (w.tags||[]).some(t => tagset.has(t));
    const rhit = !ratingFilter || w.rating===ratingFilter;
    return qhit && thit && rhit;
  });
}

// Studio Office: tasks & chat (local)
function newId(prefix){ return prefix + "_" + Math.random().toString(36).slice(2,8); }
function officeFor(studioId){
  const s = studioById(studioId); if(!s.office) s.office = { tasks:[], chat:[] }; saveState(); return s.office;
}
function addMemberToStudio(studioId, handle){
  const s = studioById(studioId); const u = userByHandle(handle);
  if(!s || !u) return false;
  if(!s.members.includes(u.id)) s.members.push(u.id);
  saveState(); return true;
}
function addTask(studioId, payload){
  const o = officeFor(studioId);
  const t = { id:newId("task"), title:payload.title, status:payload.status||"Backlog",
              assignee:payload.assignee||null, workId:payload.workId||null, partIndex:payload.partIndex||null,
              notes:payload.notes||"", createdAt:now() };
  o.tasks.push(t); saveState(); return t;
}
function moveTask(studioId, taskId, status){ const o = officeFor(studioId); const t = o.tasks.find(x=>x.id===taskId); if(t){ t.status=status; saveState(); } }
function addChat(studioId, text){ const o = officeFor(studioId); o.chat.push({ id:newId("msg"), text, at:now(), by:state.me }); saveState(); }

// Cart & Fees
function addToCart(listingId, qty=1){ const item = state.cart.find(i=>i.listingId===listingId); if(item) item.qty += qty; else state.cart.push({ listingId, qty }); saveState(); }
function removeFromCart(listingId){ state.cart = state.cart.filter(i=>i.listingId!==listingId); saveState(); }
function priceBreakdown(){
  let subtotal = 0; for(const item of state.cart){ const l = byId(state.listings, item.listingId); if(!l||!l.active) continue; subtotal += l.priceCents * item.qty; }
  const platformFee = Math.round(subtotal * 0.01);
  const paymentFee = Math.round(subtotal * 0.029) + 30;
  const creatorPayout = Math.max(0, subtotal - platformFee - paymentFee);
  return { subtotal, platformFee, paymentFee, creatorPayout, total: subtotal };
}
function simulateCheckout(){ const { subtotal } = priceBreakdown(); if(subtotal<=0) return { ok:false, message:"Cart is empty." }; state.cart=[]; saveState(); return { ok:true, message:"Checkout complete! (simulation)" }; }

// Trending score
function trendingScore(p){ return (p.likes*2) + Math.floor(p.views/10); }
