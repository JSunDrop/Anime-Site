// Larger seed with more works + tags
const STORAGE_KEY = "otakuhub_grande_state_v1";
const now = () => new Date().toISOString();

const initialState = {
  users: [{ id:"u_demo", handle:"demo", displayName:"Demo User", avatar:null }],
  studios: [
    { id:"s_oni", name:"OniWorks", slug:"oniworks", bio:"Indie anime studio.", ownerId:"u_demo", members:["u_demo"], avatar:"assets/placeholder.svg" },
    { id:"s_mako", name:"Mako Reactor", slug:"mako-reactor", bio:"Sci-fi synth vibes.", ownerId:"u_demo", members:["u_demo"], avatar:"assets/placeholder.svg" }
  ],
  works: [
    {
      id:"w_blade", studioId:"s_oni", kind:"manga", title:"Blade of Dawn", slug:"blade-of-dawn",
      synopsis:"A young swordsman seeks the sun blade.", tags:["shounen","adventure","fantasy"],
      cover:"assets/placeholder.svg", createdAt: now(),
      parts:[{ id:"p_blade_1", index:1, title:"Chapter 1: Ember", public:true, publishedAt: now(), pages:[
        {id:"pg1", pageNum:1, imageUrl:"assets/placeholder.svg"},
        {id:"pg2", pageNum:2, imageUrl:"assets/placeholder.svg"}], video:null, likes:25, views:402 }]
    },
    {
      id:"w_spark", studioId:"s_oni", kind:"animation", title:"Spark Runner", slug:"spark-runner",
      synopsis:"Courier races through neon cityscapes.", tags:["sci-fi","action","neon"],
      cover:"assets/placeholder.svg", createdAt: now(),
      parts:[{ id:"p_spark_ep1", index:1, title:"Episode 1: Night Shift", public:true, publishedAt: now(), pages:[], video:{posterUrl:"assets/placeholder.svg"}, likes:17, views:180 }]
    },
    {
      id:"w_azure", studioId:"s_mako", kind:"manga", title:"Azure Lullaby", slug:"azure-lullaby",
      synopsis:"Dream-divers rescue melodies from a flooded city.", tags:["drama","music","fantasy"],
      cover:"assets/placeholder.svg", createdAt: now(),
      parts:[{ id:"p_azure_1", index:1, title:"Chapter 1: Undertow", public:true, publishedAt: now(), pages:[
        {id:"pg1", pageNum:1, imageUrl:"assets/placeholder.svg"}], video:null, likes:36, views:520 }]
    },
    {
      id:"w_rail", studioId:"s_mako", kind:"animation", title:"Railgun Waltz", slug:"railgun-waltz",
      synopsis:"A conductor who dances with lightning.", tags:["action","fantasy","steampunk"],
      cover:"assets/placeholder.svg", createdAt: now(),
      parts:[{ id:"p_rail_1", index:1, title:"Episode 1: Overture", public:true, publishedAt: now(), pages:[], video:{posterUrl:"assets/placeholder.svg"}, likes:29, views:610 }]
    }
  ],
  listings: [
    { id:"l1", workId:"w_blade", title:"Blade of Dawn — Digital Vol.1 (PDF)", priceCents:700, currency:"USD", stock:null, active:true, sellerStudioId:"s_oni" },
    { id:"l2", workId:"w_spark", title:"Spark Runner — Early Access", priceCents:400, currency:"USD", stock:null, active:true, sellerStudioId:"s_oni" },
    { id:"l3", workId:"w_azure", title:"Azure Lullaby — OST (FLAC)", priceCents:500, currency:"USD", stock:null, active:true, sellerStudioId:"s_mako" },
    { id:"l4", workId:"w_rail", title:"Railgun Waltz — Poster Pack", priceCents:300, currency:"USD", stock:null, active:true, sellerStudioId:"s_mako" }
  ],
  likes:{}, cart:[], me:"u_demo"
};

function loadState(){
  try{
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return s || initialState;
  }catch(e){ return initialState; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
let state = loadState();

// Helpers
const byId = (arr, id) => arr.find(x => x.id === id);
const workBySlug = slug => state.works.find(w => w.slug === slug);
const studioById = id => byId(state.studios, id);
const partsOfWork = w => w.parts.sort((a,b)=>a.index-b.index);
const currency = (cents, curr="USD") => new Intl.NumberFormat(undefined, { style:'currency', currency: curr }).format(cents/100);

function allParts(){ return state.works.flatMap(w => w.parts); }
function toggleLike(partId){
  state.likes[partId] = !state.likes[partId];
  const p = allParts().find(p => p.id === partId);
  if(p) p.likes = Math.max(0, p.likes + (state.likes[partId] ? 1 : -1));
  saveState();
}

function createStudio(name, slug, bio){
  const id = "s_"+Math.random().toString(36).slice(2,8);
  const studio = { id, name, slug, bio, ownerId: state.me, members:[state.me], avatar:"assets/placeholder.svg"};
  state.studios.push(studio); saveState(); return studio;
}
function createWork({studioId, title, kind, synopsis, tags}){
  const id = "w_"+Math.random().toString(36).slice(2,8);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const w = { id, studioId, kind, title, slug, synopsis, tags, cover:"assets/placeholder.svg", createdAt: now(), parts:[] };
  state.works.unshift(w); saveState(); return w;
}
function createPart(workId, title){
  const w = byId(state.works, workId);
  const nextIndex = (w.parts.map(p=>p.index).sort((a,b)=>b-a)[0] || 0) + 1;
  const id = "p_"+Math.random().toString(36).slice(2,8);
  const p = { id, index: nextIndex, title, public:true, publishedAt: now(), pages:[], video:null, likes:0, views:0 };
  w.parts.push(p); saveState(); return p;
}
async function addPages(partId, files){
  const p = allParts().find(x=>x.id===partId);
  if(!p) return;
  for(const file of files){
    const dataUrl = await toDataURL(file);
    p.pages.push({ id: "pg_"+Math.random().toString(36).slice(2,8), pageNum: p.pages.length+1, imageUrl: dataUrl });
  }
  saveState();
}
function toDataURL(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Search & Filters
function uniqueTags(){
  const set = new Set();
  for(const w of state.works){ (w.tags||[]).forEach(t => set.add(t)); }
  return Array.from(set).sort();
}
function searchWorks(q, tags=[]){
  q = (q||"").trim().toLowerCase();
  const tagset = new Set(tags);
  return state.works.filter(w => {
    const qhit = !q || w.title.toLowerCase().includes(q) || (w.tags||[]).join(" ").toLowerCase().includes(q);
    const thit = tagset.size === 0 || (w.tags||[]).some(t => tagset.has(t));
    return qhit && thit;
  });
}

// Cart & Fees
function addToCart(listingId, qty=1){
  const item = state.cart.find(i=>i.listingId===listingId);
  if(item) item.qty += qty; else state.cart.push({ listingId, qty });
  saveState();
}
function removeFromCart(listingId){ state.cart = state.cart.filter(i=>i.listingId!==listingId); saveState(); }
function priceBreakdown(){
  let subtotal = 0;
  for(const item of state.cart){
    const listing = byId(state.listings, item.listingId);
    if(!listing || !listing.active) continue;
    subtotal += listing.priceCents * item.qty;
  }
  const platformFee = Math.round(subtotal * 0.01);
  const paymentFee = Math.round(subtotal * 0.029) + 30;
  const creatorPayout = Math.max(0, subtotal - platformFee - paymentFee);
  return { subtotal, platformFee, paymentFee, creatorPayout, total: subtotal };
}
function simulateCheckout(){
  const { subtotal } = priceBreakdown();
  if(subtotal <= 0) return { ok:false, message:"Cart is empty." };
  state.cart = []; saveState();
  return { ok:true, message:"Checkout complete! (simulation)" };
}

// Leaderboard score
function trendingScore(p){ return (p.likes*2) + Math.floor(p.views/10); }
