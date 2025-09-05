// Classic app data + state
const STORAGE_KEY="otakuhub_v33_state";
const now=()=>new Date().toISOString();

const RATINGS=["E","T","M","X"];
const RATING_LABEL={E:"Everyone",T:"Teen (13+)",M:"Mature (17+)",X:"Explicit (18+)"};
const RATING_MIN_AGE={E:0,T:13,M:17,X:18};

const initialState={
  users:[{id:"u_demo",handle:"demo",displayName:"Demo User",avatar:null,bio:"Explorer"}],
  account:{userId:"u_demo",dob:null,handle:null,displayName:null},
  studios:[
    {id:"s_oni",name:"OniWorks",slug:"oniworks",bio:"Indie anime studio.",ownerId:"u_demo",members:["u_demo"],avatar:"assets/placeholder.svg",office:{tasks:[],chat:[]}},
    {id:"s_mako",name:"Mako Reactor",slug:"mako-reactor",bio:"Sci-fi synth vibes.",ownerId:"u_demo",members:["u_demo"],avatar:"assets/placeholder.svg",office:{tasks:[],chat:[]}}
  ],
  works:[
    {id:"w_blade",studioId:"s_oni",kind:"manga",title:"Blade of Dawn",slug:"blade-of-dawn",synopsis:"A young swordsman seeks the sun blade.",tags:["shounen","adventure","fantasy"],rating:"T",cover:"assets/placeholder.svg",createdAt:now(),parts:[
      {id:"p_blade_1",index:1,title:"Chapter 1: Ember",rating:"T",public:true,publishedAt:now(),pages:[{id:"pg1",pageNum:1,imageUrl:"assets/placeholder.svg"},{id:"pg2",pageNum:2,imageUrl:"assets/placeholder.svg"}],video:null,likes:25,views:402}
    ]},
    {id:"w_spark",studioId:"s_oni",kind:"animation",title:"Spark Runner",slug:"spark-runner",synopsis:"Courier races through neon cityscapes.",tags:["sci-fi","action","neon"],rating:"T",cover:"assets/placeholder.svg",createdAt:now(),parts:[
      {id:"p_spark_ep1",index:1,title:"Episode 1: Night Shift",rating:"T",public:true,publishedAt:now(),pages:[],video:{posterUrl:"assets/placeholder.svg"},likes:17,views:180}
    ]},
    {id:"w_azure",studioId:"s_mako",kind:"manga",title:"Azure Lullaby",slug:"azure-lullaby",synopsis:"Dream-divers rescue melodies from a flooded city.",tags:["drama","music","fantasy"],rating:"M",cover:"assets/placeholder.svg",createdAt:now(),parts:[
      {id:"p_azure_1",index:1,title:"Chapter 1: Undertow",rating:"M",public:true,publishedAt:now(),pages:[{id:"pg1",pageNum:1,imageUrl:"assets/placeholder.svg"}],video:null,likes:36,views:520}
    ]},
    {id:"w_rail",studioId:"s_mako",kind:"animation",title:"Railgun Waltz",slug:"railgun-waltz",synopsis:"A conductor who dances with lightning.",tags:["action","fantasy","steampunk"],rating:"E",cover:"assets/placeholder.svg",createdAt:now(),parts:[
      {id:"p_rail_1",index:1,title:"Episode 1: Overture",rating:"E",public:true,publishedAt:now(),pages:[],video:{posterUrl:"assets/placeholder.svg"},likes:29,views:610}
    ]}
  ],
  listings:[
    {id:"l1",workId:"w_blade",title:"Blade of Dawn — Digital Vol.1 (PDF)",priceCents:700,currency:"USD",stock:null,active:true,sellerStudioId:"s_oni"},
    {id:"l2",workId:"w_spark",title:"Spark Runner — Early Access",priceCents:400,currency:"USD",stock:null,active:true,sellerStudioId:"s_oni"},
    {id:"l3",workId:"w_azure",title:"Azure Lullaby — OST (FLAC)",priceCents:500,currency:"USD",stock:null,active:true,sellerStudioId:"s_mako"},
    {id:"l4",workId:"w_rail",title:"Railgun Waltz — Poster Pack",priceCents:300,currency:"USD",stock:null,active:true,sellerStudioId:"s_mako"}
  ],
  likes:{},favorites:[],followedStudios:[],progress:{},
  comments:{}, live:{general:[{id:"m1",by:"u_demo",at:now(),text:"Welcome to the live chat!"}]},
  forum:{categories:[
    {id:"c_general",name:"General",description:"Chat about anything anime/manga."},
    {id:"c_help",name:"Help",description:"Publishing & tech help."},
    {id:"c_feedback",name:"Feedback",description:"Suggest features & report issues."},
    {id:"c_showcase",name:"Showcase",description:"Share your works & progress."}
  ], threads:[{id:"t_welcome",categoryId:"c_general",title:"Welcome to OtakuHub!",authorId:"u_demo",at:now(),posts:[{id:"po1",by:"u_demo",at:now(),text:"Say hi and share what you’re making!"}]}]},
  notifications:[], reports:[], cart:[]
};

function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState } catch(e){ return initialState } }
let state = load();
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }
const userById=id=>state.users.find(u=>u.id===id);
const studioById=id=>state.studios.find(s=>s.id===id);
const workBySlug=slug=>state.works.find(w=>w.slug===slug);
const partsOfWork=w=>w.parts.filter(p=>p.public).sort((a,b)=>a.index-b.index);
const uniqueTags=()=>{const s=new Set();state.works.forEach(w=>(w.tags||[]).forEach(t=>s.add(t)));return Array.from(s).sort()}

function userAge(){ const d=state.account?.dob; if(!d) return 0; const dob=new Date(d), t=new Date(); let a=t.getFullYear()-dob.getFullYear(); const m=t.getMonth()-dob.getMonth(); if(m<0||(m===0&&t.getDate()<dob.getDate())) a--; return a }
function meets(code){ return userAge() >= (RATING_MIN_AGE[code||"E"]||0) }
function isLockedWork(w){ return !meets(w.rating) }
function isLockedPart(p){ return !meets(p.rating) }

function newId(p="id"){ return p+"_"+Math.random().toString(36).slice(2,8) }

// Likes/favorites/progress
function toggleLike(partId){ const liked=state.likes[partId]=!state.likes[partId]; const p=state.works.flatMap(w=>w.parts).find(p=>p.id===partId); if(p) p.likes = Math.max(0, p.likes + (liked?1:-1)); save() }
function toggleFavorite(workId){ const i=state.favorites.indexOf(workId); if(i>=0) state.favorites.splice(i,1); else state.favorites.push(workId); save() }
function markProgress(workId, partIndex, pageNum){ state.progress[workId]={partIndex,pageNum:pageNum||1}; save() }
function getProgress(workId){ return state.progress[workId]||null }

// Search & sort
function searchWorks(q, tags=[]){ q=(q||"").toLowerCase(); const ts=new Set(tags); return state.works.filter(w=>{
  const qhit=!q || w.title.toLowerCase().includes(q) || (w.tags||[]).join(" ").toLowerCase().includes(q);
  const thit=ts.size===0 || (w.tags||[]).some(t=>ts.has(t));
  return qhit && thit;
})}
function sortWorks(list, mode="trending"){
  const score=p=>(p.likes*2)+Math.floor(p.views/10);
  if(mode==="trending") return list.slice().sort((a,b)=>Math.max(...b.parts.map(score))-Math.max(...a.parts.map(score)));
  if(mode==="new") return list.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(mode==="top") return list.slice().sort((a,b)=>b.parts.reduce((s,p)=>s+p.likes,0)-a.parts.reduce((s,p)=>s+p.likes,0));
  return list;
}
function recommend(){
  const tagScore={};
  Object.entries(state.likes).forEach(([pid,liked])=>{
    if(!liked) return; const part=state.works.flatMap(w=>w.parts).find(p=>p.id===pid);
    const w=state.works.find(ww=>ww.parts.includes(part)); if(!w) return; (w.tags||[]).forEach(t=>tagScore[t]=(tagScore[t]||0)+2);
  });
  state.favorites.forEach(wid=>{ const w=state.works.find(x=>x.id===wid); (w?.tags||[]).forEach(t=>tagScore[t]=(tagScore[t]||0)+3) });
  const top=Object.entries(tagScore).sort((a,b)=>b[1]-a[1])[0]?.[0]; if(!top) return state.works.slice(0,6);
  return state.works.filter(w=>w.tags.includes(top)).slice(0,6);
}

// Comments
function commentsFor(targetType, targetId){ const key=`${targetType}:${targetId}`; return state.comments[key]||[] }
function addComment(targetType, targetId, text){ const key=`${targetType}:${targetId}`; state.comments[key]=state.comments[key]||[]; state.comments[key].push({id:newId("c"),by:state.account.userId,at:now(),text}); save() }

// Forum & live
function liveMessages(){ return state.live.general }
function sendLive(text){ state.live.general.push({id:newId("m"),by:state.account.userId,at:now(),text}); save() }

// Market
function currency(cents,curr="USD"){ return new Intl.NumberFormat(undefined,{style:'currency',currency:curr}).format(cents/100) }
function addToCart(id,qty=1){ const i=state.cart.find(x=>x.listingId===id); if(i) i.qty+=qty; else state.cart.push({listingId:id,qty}); save() }
function removeFromCart(id){ state.cart=state.cart.filter(i=>i.listingId!==id); save() }
function priceBreakdown(){ let subtotal=0; state.cart.forEach(ci=>{ const l=state.listings.find(x=>x.id===ci.listingId); if(l) subtotal+=l.priceCents*ci.qty }); const platformFee=Math.round(subtotal*.01); const paymentFee=Math.round(subtotal*.029)+30; const creatorPayout=Math.max(0, subtotal-platformFee-paymentFee); return {subtotal,platformFee,paymentFee,creatorPayout,total:subtotal} }

// Toasts
function notify(text){ state.notifications.push({id:newId("n"),text}); try{ renderToasts() }catch{} }
