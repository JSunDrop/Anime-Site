(function(){
  if(!location.hash) location.hash = '#/landing';
  const app=document.getElementById('app'); const toast=document.getElementById('toast');
  function notify(t){const n=document.createElement('div');n.className='toast';n.textContent=t;toast.appendChild(n);setTimeout(()=>{toast.removeChild(n)},1800)}
  function route(){const h=location.hash||'#/landing';const [_,p,a,b]=h.split('/');return {p,a,b}}
  addEventListener('hashchange',render); addEventListener('load',render);
  function landing(){app.innerHTML=`<section class="panel">
      <h1>The creator-first platform for anime & manga.</h1>
      <p>Publish series, run a studio, and connect with fans — with age protection and a 1% platform fee.</p>
      <p><a class="button" href="#/home">Enter App</a> <a class="button" href="#/explore">Explore</a> <a class="button" href="#/advanced">Advanced</a></p>
    </section>`}
  function ensureDOB(){ if(!state.account.dob){ app.innerHTML=`<section class="panel"><h2>Create Profile</h2><label>DOB <input id="dob" class="input" type="date"/></label><div style="text-align:right"><button class="button" id="s">Save</button></div></section>`; document.getElementById('s').onclick=()=>{const d=document.getElementById('dob').value; if(!d) return alert('Set DOB'); state.account.dob=d; save(); location.hash='#/home'}; return false } return true }
  function home(){ if(!ensureDOB()) return; app.innerHTML=`<section class="panel"><h2>Create. Publish. Collaborate.</h2><p>Demo home — try Explore or Publish.</p><a class="button" href="#/explore">Explore</a> <a class="button" href="#/publish">Publish</a></section>` }
  function explore(){ if(!ensureDOB()) return; app.innerHTML=`<section class="panel"><h2>Explore</h2><p>Sample content area.</p></section>` }
  function publish(){ if(!ensureDOB()) return; app.innerHTML=`<section class="panel"><h2>Publish (Prototype)</h2><p>Creator flow placeholder.</p></section>` }
  function advanced(){ app.innerHTML=`<section class="panel"><h2>Advanced</h2><label>DOB <input id="dob" class="input" type="date" value="${state.account.dob||''}"/></label><div style="text-align:right"><button class="button" id="s">Save</button></div></section>`; document.getElementById('s').onclick=()=>{const d=document.getElementById('dob').value; if(!d) return alert('Set DOB'); state.account.dob=d; save(); notify('Saved.') } }
  function policy(){ app.innerHTML=`<section class="panel"><h2>Policy</h2><p>Community guidelines placeholder.</p></section>` }
  function render(){ const {p,a,b}=route(); if(p==='landing') return landing(); if(p==='home') return home(); if(p==='explore') return explore(); if(p==='publish') return publish(); if(p==='advanced') return advanced(); if(p==='policy') return policy(); landing(); }
  render();
})();