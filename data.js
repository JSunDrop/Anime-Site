
const STORAGE_KEY="oh_v2_state";
const RATINGS=["E","T","M","X"];const RATING_LABEL={E:"Everyone",T:"Teen (13+)",M:"Mature (17+)",X:"Explicit (18+)"};const RATING_MIN={E:0,T:13,M:17,X:18};
const now=()=>new Date().toISOString();
const initial={account:{userId:"u_demo",dob:null},users:[{id:"u_demo",handle:"demo",displayName:"Demo",badges:["First Upload"]}],studios:[{id:"s_oni",name:"OniWorks",slug:"oni",members:["u_demo"],avatar:"assets/placeholder.svg",office:{tasks:[],chat:[]}}],works:[{id:"w1",studioId:"s_oni",kind:"manga",title:"Blade of Dawn",slug:"blade",synopsis:"A young swordsman seeks the sun blade.",tags:["shounen","adventure"],rating:"T",cover:"assets/placeholder.svg",parts:[{id:"p1",index:1,title:"Ch.1",rating:"T",public:true,pages:[{pageNum:1,imageUrl:"assets/placeholder.svg"}],video:null,likes:3,views:55}]}],listings:[],likes:{},favorites:[],progress:{},comments:{},forum:{categories:[{id:"c_general",name:"General",description:"Chat about anything."}],threads:[{id:"t1",categoryId:"c_general",title:"Welcome!",authorId:"u_demo",at:now(),posts:[{id:"po1",by:"u_demo",at:now(),text:"Say hi!"}]}]},live:{general:[{id:"m1",by:"u_demo",at:now(),text:"Welcome to live chat!"}]} };
let state;try{state=JSON.parse(localStorage.getItem(STORAGE_KEY))||initial}catch(e){state=initial}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
const byId=(a,id)=>a.find(x=>x.id===id), workBySlug=s=>state.works.find(w=>w.slug===s), partsOf=w=>w.parts.filter(p=>p.public).sort((a,b)=>a.index-b.index);
function userAge(){const d=state.account.dob;if(!d)return 0;const dob=new Date(d),t=new Date();let a=t.getFullYear()-dob.getFullYear();const m=t.getMonth()-dob.getMonth();if(m<0||(m===0&&t.getDate()<dob.getDate()))a--;return a}
const meets=r=>userAge()>=RATING_MIN[r]; const lockedW=w=>!meets(w.rating); const lockedP=p=>!meets(p.rating);
function search(q="",tags=[]){q=q.toLowerCase();const tag=new Set(tags);return state.works.filter(w=>(!q||w.title.toLowerCase().includes(q)||(w.tags||[]).join(" ").toLowerCase().includes(q))&&(tag.size===0||(w.tags||[]).some(t=>tag.has(t))))}
function markProgress(wid,idx,pn){state.progress[wid]={partIndex:idx,pageNum:pn||1};save()}
function getStart(w){const ps=partsOf(w),pr=state.progress[w.id];if(pr){return ps.find(p=>p.index===pr.partIndex)||ps[0]}return ps[0]}
function toggleFav(wid){const i=state.favorites.indexOf(wid);if(i>=0)state.favorites.splice(i,1);else state.favorites.push(wid);save()}
function commentsFor(t,id){const k=t+':'+id;return state.comments[k]||[]} function addComment(t,id,txt){const k=t+':'+id;(state.comments[k]=state.comments[k]||[]).push({id:Math.random().toString(36).slice(2),by:state.account.userId,at:now(),text:txt});save()}
function recommend(){const favTags={};for(const wid of state.favorites){const w=byId(state.works,wid);for(const t of (w?.tags||[]))favTags[t]=(favTags[t]||0)+1}const top=Object.entries(favTags).sort((a,b)=>b[1]-a[1])[0]?.[0];return top?state.works.filter(w=>w.tags.includes(top)).slice(0,6):state.works.slice(0,6)}
