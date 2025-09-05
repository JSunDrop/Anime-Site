// State V3 with reports, toasts, command palette data, and improved search/sort
const STORAGE_KEY = "otakuhub_grande_pro_v3_state";
const now = () => new Date().toISOString();

const RATINGS = ["E","T","M","X"];
const RATING_LABEL = { E:"Everyone", T:"Teen (13+)", M:"Mature (17+)", X:"Explicit (18+)" };
const RATING_MIN_AGE = { E:0, T:13, M:17, X:18 };

const initialState = {
  users: [{ id:"u_demo", handle:"demo", displayName:"Demo User", avatar:null, bio:"Explorer", badges:["First Upload"] }],
  account: { userId:"u_demo", dob:null },
  studios: [
    { id:"s_oni", name:"OniWorks", slug:"oniworks", bio:"Indie anime studio.", ownerId:"u_demo", members:["u_demo"], avatar:"assets/placeholder.svg", office:{ tasks:[], chat:[] } },
    { id:"s_mako", name:"Mako Reactor", slug:"mako-reactor", bio:"Sci-fi synth vibes.", ownerId:"u_demo", members:["u_demo"], avatar:"assets/placeholder.svg", office:{ tasks:[], chat:[] } }
  ],
  works: [
    { id:"w_blade", studioId:"s_oni", kind:"manga", title:"Blade of Dawn", slug:"blade-of-dawn",
      synopsis:"A young swordsman seeks the sun blade.", tags:["shounen","adventure","fantasy"],
      rating:"T", cover:"assets/placeholder.svg", createdAt: now(),
      parts:[{ id:"p_blade_1", index:1, title:"Chapter 1: Ember", rating:"T", public:true, publishedAt: now(),
               pages:[{id:"pg1", pageNum:1, imageUrl:"assets/placeholder.svg"},{id:"pg2", pageNum:2, imageUrl:"assets/placeholder.svg"}],
               video:null, likes:25, views:402 }]},
    { id:"w_spark", studioId:"s_oni", kind:"animation", title:"Spark Runner", slug:"spark-runner",
      synopsis:"Courier races through neon cityscapes.", tags:["sci-fi","action","neon"],
      rating:"T", cover:"assets/placeholder.svg", createdAt: now(),
      parts:[{ id:"p_spark_ep1", index:1, title:"Episode 1: Night Shift", rating:"T", public:true, publishedAt: now(), pages:[],
               video:{posterUrl:"assets/placeholder.svg"}, likes:17, views:180 }]},
    { id:"w_azure", studioId:"s_mako", kind:"manga", title:"Azure Lullaby", slug:"azure-lullaby",
      synopsis:"Dream-divers rescue melodies from a flooded city.", tags:["drama","music","fantasy"],
      rating:"M", cover:"assets/placeholder.svg", createdAt: now(),
      parts:[{ id:"p_azure_1", index:1, title:"Chapter 1: Undertow", rating:"M", public:true, publishedAt: now(),
               pages:[{id:"pg1", pageNum:1, imageUrl:"assets/placeholder.svg"}], video:null, likes:36, views:520 }]},
    { id:"w_rail", studioId:"s_mako", kind:"animation", title:"Railgun Waltz", slug:"railgun-waltz",
      synopsis:"A conductor who dances with lightning.", tags:["action","fantasy","steampunk"],
      rating:"E", cover:"assets/placeholder.svg", createdAt: now(),
      parts:[{ id:"p_rail_1", index:1, title:"Episode 1: Overture", rating:"E", public:true, publishedAt: now(),
               pages:[], video:{posterUrl:"assets/placeholder.svg"}, likes:29, views:610 }]}
  ],
  listings: [
    { id:"l1", workId:"w_blade", title:"Blade of Dawn — Digital Vol.1 (PDF)", priceCents:700, currency:"USD", stock:null, active:true, sellerStudioId:"s_oni" },
    { id:"l2", workId:"w_spark", title:"Spark Runner — Early Access", priceCents:400, currency:"USD", stock:null, active:true, sellerStudioId:"s_oni" },
    { id:"l3", workId:"w_azure", title:"Azure Lullaby — OST (FLAC)", priceCents:500, currency:"USD", stock:null, active:true, sellerStudioId:"s_mako" },
    { id:"l4", workId:"w_rail", title:"Railgun Waltz — Poster Pack", priceCents:300, currency:"USD", stock:null, active:true, sellerStudioId:"s_mako" }
  ],
  likes:{}, cart:[], me:"u_demo",
  followedStudios:[], favorites:[], progress:{},
  comments:{}, forum:{ categories:[
      { id:"c_general", name:"General", description:"Chat about anything anime/manga." },
      { id:"c_help", name:"Help", description:"Publishing & tech help." },
      { id:"c_feedback", name:"Feedback", description:"Suggest features & report issues." },
      { id:"c_showcase", name:"Showcase", description:"Share your works & progress." }
    ],
    threads:[{ id:"t_welcome", categoryId:"c_general", title:"Welcome to OtakuHub!", authorId:"u_demo", at: now(),
      posts:[{ id:"po1", by:"u_demo", at: now(), text:"Say hi and share what you’re making!" }]}]
  },
  live: { general: [{ id:"m1", by:"u_demo", at: now(), text:"Welcome to the live chat!" }] },
  reports: [], // {id, workId, partId?, reason, details, by, at}
  notifications: [] // ephemeral toasts
};

function loadState(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState; } catch(e){ return initialState; } }
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
let state = loadState();

// Helpers
const byId = (arr, id) => arr.find(x => x.id === id);
const workBySlug = slug => state.works.find(w => w.slug === slug);
const studioById = id => byId(state.studios, id);
const userById = id => byId(state.users, id);
const partsOfWork = w => w.parts.filter(p=>p.public).sort((a,b)=>a.index-b.index);
const currency = (cents, curr="USD") => new Intl.NumberFormat(undefined, { style:'currency', currency: curr }).format(cents/100);
function allParts(){ return state.works.flatMap(w => w.parts); }
function uniqueTags(){ const s = new Set(); for(const w of state.works){ (w.tags||[]).forEach(t => s.add(t)); } return Array.from(s).sort(); }
function newId(p="id"){ return p+"_"+Math.random().toString(36).slice(2,8); }

// Age utils
function userDOB(){ return state.account?.dob || null; }
function userAge(){
  const d = userDOB(); if(!d) return 0;
  const dob = new Date(d); const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if(m < 0 || (m===0 && today.getDate() < dob.getDate())) age--;
  return age;
}
function meetsRating(code){ const needed = RATING_MIN_AGE[code || "E"] ?? 0; return userAge() >= needed; }
function isLockedWork(w){ return !meetsRating(w.rating); }
function isLockedPart(p){ return !meetsRating(p.rating); }

// Likes / favorites
function toggleLike(partId){ state.likes[partId] = !state.likes[partId]; const p = allParts().find(p => p.id === partId); if(p) p.likes = Math.max(0, p.likes + (state.likes[partId] ? 1 : -1)); saveState(); }
function toggleFavorite(workId){ const i = state.favorites.indexOf(workId); if(i>=0) state.favorites.splice(i,1); else state.favorites.push(workId); saveState(); }
function isFavorite(workId){ return state.favorites.includes(workId); }

// Follow & studio members
function isFollowing(studioId){ return state.followedStudios.includes(studioId); }
function toggleFollow(studioId){ if(isFollowing(studioId)) state.followedStudios = state.followedStudios.filter(id => id !== studioId); else state.followedStudios.push(studioId); saveState(); }

// Progress
function markProgress(workId, partIndex, pageNum){ state.progress[workId] = { partIndex, pageNum: pageNum||1 }; saveState(); }
function getProgress(workId){ return state.progress[workId] || null; }
function getStartPart(work){
  const parts = partsOfWork(work); const prog = getProgress(work.id);
  if(prog){ return parts.find(p => p.index === prog.partIndex) || parts[0]; }
  return parts[0];
}

// Search & Recs
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
function sortWorks(list, mode="trending"){
  const score = (p)=> (p.likes*2) + Math.floor(p.views/10);
  if(mode==="trending"){ return list.slice().sort((a,b)=> {
    const ap = Math.max(...a.parts.map(score)); const bp = Math.max(...b.parts.map(score)); return bp - ap;
  });}
  if(mode==="new"){ return list.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)); }
  if(mode==="top"){ return list.slice().sort((a,b)=> {
    const al = a.parts.reduce((s,p)=>s+p.likes,0); const bl = b.parts.reduce((s,p)=>s+p.likes,0); return bl-al;
  });}
  return list;
}
function recommend(){
  const tagScore = {};
  const likedPartIds = Object.keys(state.likes).filter(k => state.likes[k]);
  for(const pid of likedPartIds){
    const part = allParts().find(p => p.id===pid);
    const w = state.works.find(x => x.parts.includes(part));
    for(const t of (w?.tags||[])) tagScore[t] = (tagScore[t]||0) + 2;
  }
  for(const wid of state.favorites){
    const w = state.works.find(x=>x.id===wid);
    for(const t of (w?.tags||[])) tagScore[t] = (tagScore[t]||0) + 3;
  }
  const topTag = Object.entries(tagScore).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
  if(!topTag) return state.works.slice(0,6);
  return state.works.filter(w => w.tags.includes(topTag)).slice(0,6);
}

// Comments
function commentsFor(targetType, targetId){
  const key = `${targetType}:${targetId}`;
  return state.comments[key] || [];
}
function addComment(targetType, targetId, text){
  const key = `${targetType}:${targetId}`;
  if(!state.comments[key]) state.comments[key] = [];
  state.comments[key].push({ id:newId("c"), by: state.me, at: now(), text });
  saveState();
}

// Reporting
function reportContent({ workId, partId=null, reason, details }){
  state.reports.push({ id:newId("r"), workId, partId, reason, details, by: state.me, at: now() });
  notify("Thanks — your report was received.");
  saveState();
}

// Live chat
function liveMessages(){ return state.live.general; }
function sendLive(text){ state.live.general.push({ id:newId("m"), by: state.me, at: now(), text }); saveState(); }

// Cart & Fees
function addToCart(listingId, qty=1){ const item = state.cart.find(i=>i.listingId===listingId); if(item) item.qty += qty; else state.cart.push({ listingId, qty }); saveState(); }
function removeFromCart(listingId){ state.cart = state.cart.filter(i=>i.listingId!==listingId); saveState(); }
function priceBreakdown(){
  let subtotal = 0; for(const item of state.cart){ const l = state.listings.find(x=>x.id===item.listingId); if(!l||!l.active) continue; subtotal += l.priceCents * item.qty; }
  const platformFee = Math.round(subtotal * 0.01);
  const paymentFee = Math.round(subtotal * 0.029) + 30;
  const creatorPayout = Math.max(0, subtotal - platformFee - paymentFee);
  return { subtotal, platformFee, paymentFee, creatorPayout, total: subtotal };
}
function simulateCheckout(){ const { subtotal } = priceBreakdown(); if(subtotal<=0) return { ok:false, message:"Cart is empty." }; state.cart=[]; saveState(); return { ok:true, message:"Checkout complete! (simulation)" }; }

// Notifications
function notify(text){ state.notifications.push({ id:newId("n"), text }); try{ renderToasts(); }catch(e){} }
