// Starfield background
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let stars = [];
function resize(){
  canvas.width = innerWidth; canvas.height = innerHeight;
  stars = Array.from({length: Math.min(320, Math.floor(innerWidth*innerHeight/6000))}, () => ({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*1.2+0.2, v: Math.random()*0.3+0.05
  }));
}
addEventListener('resize', resize); resize();
(function tick(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#0a1224'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'rgba(124,198,255,0.85)';
  for(const s of stars){
    ctx.globalAlpha = 0.4 + Math.sin((performance.now()/1000 + s.x)*s.v)*0.3;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    s.y += s.v; if(s.y > canvas.height){ s.y = -2; s.x = Math.random()*canvas.width; }
  }
  requestAnimationFrame(tick);
})();