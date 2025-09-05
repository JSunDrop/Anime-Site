// Subtle falling stars
const canvas=document.getElementById('bg');const ctx=canvas.getContext('2d');
function size(){canvas.width=innerWidth;canvas.height=innerHeight}addEventListener('resize',size);size();
const stars=Array.from({length:Math.min(420,Math.floor(innerWidth*innerHeight/5000))},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,v:.2+Math.random()*.5,opacity:.2+Math.random()*.4}));
(function tick(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#0a1224';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(124,198,255,.9)';
for(const s of stars){ctx.globalAlpha=s.opacity;ctx.fillRect(s.x,s.y,2,2);s.y+=s.v;if(s.y>canvas.height){s.y=-2;s.x=Math.random()*canvas.width}}requestAnimationFrame(tick)})();