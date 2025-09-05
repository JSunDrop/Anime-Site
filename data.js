window.__BOOT_OK__=true;
const STORAGE_KEY='oh_v3_2_state'; const now=()=>new Date().toISOString();
const RATINGS=['E','T','M','X']; const RATING_MIN={E:0,T:13,M:17,X:18};
const state=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}; state.account=state.account||{dob:null};
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function age(){const d=state.account.dob;if(!d)return 0;const dob=new Date(d),t=new Date();let a=t.getFullYear()-dob.getFullYear();const m=t.getMonth()-dob.getMonth();if(m<0||(m===0&&t.getDate()<dob.getDate()))a--;return a}
