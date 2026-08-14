import {C} from './config.js';
import {project,makeViewports} from './camera.js';
import {drawCharacter} from './characters.js';

const lerp=(a,b,t)=>a+(b-a)*t;

export function render(ctx,width,height,state,assets,input){
  const vps=makeViewports(width,height,state);
  for(const vp of vps){ctx.save();ctx.beginPath();ctx.rect(vp.x,vp.y,vp.w,vp.h);ctx.clip();renderWorld(ctx,vp,state,assets);renderControls(ctx,vp,input.visuals(vp.player));renderParticles(ctx,vp,state);ctx.restore();}
  if(vps.length===2){ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(width/2-2,0,4,height);ctx.fillStyle='rgba(74,74,106,.12)';ctx.fillRect(width/2-4,0,2,height);}
  return vps;
}

function renderWorld(ctx,vp,state,assets){
  const g=ctx.createLinearGradient(0,vp.y,0,vp.h);
  g.addColorStop(0,'#CFEFFF');g.addColorStop(.45,C.COLORS.sky);g.addColorStop(.62,'#FFF4D7');g.addColorStop(1,'#F7CDB8');
  ctx.fillStyle=g;ctx.fillRect(vp.x,vp.y,vp.w,vp.h);
  drawClouds(ctx,vp,state.time);
  drawFloor(ctx,vp);
  drawTable(ctx,vp,assets);

  const cam=vp.camera,viewer=state.players[vp.player],opponent=state.players[1-vp.player];
  const op=project(vp,cam,opponent.x,.22,opponent.z);
  if(op){const size=Math.min(vp.h*.4,op.scale*.72);const img=assets.images[`${opponent.character}_${opponent.pose}`]||assets.images[`${opponent.character}_idle`];
    if(img)ctx.drawImage(img,op.sx-size*.4,op.sy-size*.68,size*.8,size);
    else drawCharacter(ctx,opponent.character,op.sx,op.sy,size,opponent.pose,cam.side>0);}

  const ballFar=(viewer.side<0?state.ball.z>0:state.ball.z<0);
  if(ballFar){drawShadow(ctx,vp,state);drawBall(ctx,vp,state,assets);}
  drawNet(ctx,vp,state,assets);
  if(!ballFar){drawShadow(ctx,vp,state);drawBall(ctx,vp,state,assets);}
  drawViewmodel(ctx,vp,viewer,assets);
}

function drawClouds(ctx,vp,time){
  ctx.save();
  for(let i=0;i<4;i++){
    const cx=vp.x+((i*0.29+0.08)*vp.w+Math.sin(time*.2+i)*10),cy=vp.h*(.1+(i%2)*.07),r=vp.w*.05+i*4;
    ctx.fillStyle='rgba(255,255,255,.75)';
    ctx.beginPath();
    ctx.arc(cx,cy,r,0,7);ctx.arc(cx+r*.9,cy+r*.15,r*.75,0,7);ctx.arc(cx-r*.9,cy+r*.15,r*.7,0,7);ctx.arc(cx+r*.2,cy-r*.4,r*.7,0,7);
    ctx.fill();
  }
  ctx.restore();
}

function drawFloor(ctx,vp){
  const fy=vp.h*.62;
  const g=ctx.createLinearGradient(0,fy,0,vp.h);
  g.addColorStop(0,'#F0C4A6');g.addColorStop(1,'#E3A987');
  ctx.fillStyle=g;ctx.fillRect(vp.x,fy,vp.w,vp.h-fy);
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;
  for(let i=0;i<=8;i++){ctx.beginPath();ctx.moveTo(vp.x+vp.w/2,fy);ctx.lineTo(vp.x+vp.w*i/8,vp.h);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,.14)';
  for(let i=1;i<4;i++){const y=lerp(fy,vp.h,i/4);ctx.beginPath();ctx.moveTo(vp.x,y);ctx.lineTo(vp.x+vp.w,y);ctx.stroke();}
}

function drawTable(ctx,vp,assets){
  const cam=vp.camera;
  const corners=[[-C.TABLE_W/2,0,-C.TABLE_L/2],[C.TABLE_W/2,0,-C.TABLE_L/2],[C.TABLE_W/2,0,C.TABLE_L/2],[-C.TABLE_W/2,0,C.TABLE_L/2]].map(p=>project(vp,cam,...p));
  if(corners.some(x=>!x))return;

  for(const[lx,lz] of [[-C.TABLE_W*.42,-C.TABLE_L*.4],[C.TABLE_W*.42,-C.TABLE_L*.4],[-C.TABLE_W*.42,C.TABLE_L*.4],[C.TABLE_W*.42,C.TABLE_L*.4]]){
    const top=project(vp,cam,lx,0,lz),bot=project(vp,cam,lx,-C.TABLE_H,lz);
    if(top&&bot){ctx.strokeStyle='rgba(74,74,106,.55)';ctx.lineWidth=Math.max(4,top.scale*.03);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(top.sx,top.sy);ctx.lineTo(bot.sx,bot.sy);ctx.stroke();}
  }

  ctx.beginPath();ctx.moveTo(corners[0].sx,corners[0].sy);for(let i=1;i<4;i++)ctx.lineTo(corners[i].sx,corners[i].sy);ctx.closePath();
  const minY=Math.min(...corners.map(c=>c.sy)),maxY=Math.max(...corners.map(c=>c.sy));
  const tg=ctx.createLinearGradient(0,minY,0,maxY);
  tg.addColorStop(0,'#FFE59A');tg.addColorStop(.5,C.COLORS.table);tg.addColorStop(1,'#F5C24A');
  ctx.fillStyle=tg;ctx.fill();
  ctx.strokeStyle='#E0A93C';ctx.lineWidth=Math.max(4,vp.w*.008);ctx.stroke();
  ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(3,vp.w*.005);ctx.stroke();
  ctx.save();
  ctx.beginPath();ctx.moveTo(corners[0].sx,corners[0].sy);for(let i=1;i<4;i++)ctx.lineTo(corners[i].sx,corners[i].sy);ctx.closePath();ctx.clip();
  ctx.fillStyle='rgba(255,255,255,.18)';
  ctx.beginPath();ctx.ellipse((corners[0].sx+corners[1].sx)/2,minY+(maxY-minY)*.28,vp.w*.28,(maxY-minY)*.16,0,0,7);ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;
  const a=project(vp,cam,0,.002,-C.TABLE_L/2),b=project(vp,cam,0,.002,C.TABLE_L/2);
  if(a&&b){ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();}
}

function drawNet(ctx,vp,state,assets){
  const cam=vp.camera,
    l=project(vp,cam,-C.TABLE_W/2-C.NET_OVERHANG,C.NET_H,0),r=project(vp,cam,C.TABLE_W/2+C.NET_OVERHANG,C.NET_H,0),
    lb=project(vp,cam,-C.TABLE_W/2-C.NET_OVERHANG,0,0),rb=project(vp,cam,C.TABLE_W/2+C.NET_OVERHANG,0,0);
  if(!l||!r||!lb||!rb)return;
  const wob=Math.sin(state.time*35)*state.netWobble*5;
  ctx.fillStyle='rgba(255,255,255,.62)';
  ctx.beginPath();ctx.moveTo(l.sx,l.sy+wob);ctx.lineTo(r.sx,r.sy-wob);ctx.lineTo(rb.sx,rb.sy);ctx.lineTo(lb.sx,lb.sy);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(74,74,106,.32)';ctx.lineWidth=1;
  for(let i=0;i<=12;i++){const t=i/12;ctx.beginPath();ctx.moveTo(lerp(l.sx,r.sx,t),lerp(l.sy+wob,r.sy-wob,t));ctx.lineTo(lerp(lb.sx,rb.sx,t),lerp(lb.sy,rb.sy,t));ctx.stroke();}
  for(let i=0;i<4;i++){const t=i/3;ctx.beginPath();ctx.moveTo(lerp(l.sx,lb.sx,t),lerp(l.sy+wob,lb.sy,t));ctx.lineTo(lerp(r.sx,rb.sx,t),lerp(r.sy-wob,rb.sy,t));ctx.stroke();}
  ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(3,vp.w*.006);ctx.beginPath();ctx.moveTo(l.sx,l.sy+wob);ctx.lineTo(r.sx,r.sy-wob);ctx.stroke();
}

function drawShadow(ctx,vp,state){
  const b=state.ball,ground=Math.abs(b.x)<=C.TABLE_W/2&&Math.abs(b.z)<=C.TABLE_L/2?0:-C.TABLE_H,p=project(vp,vp.camera,b.x,ground+.004,b.z);
  if(!p)return;const ss=1+b.y*.6,alpha=.28/(1+b.y*1.2);
  ctx.fillStyle=`rgba(74,74,106,${Math.max(.04,alpha)})`;ctx.beginPath();ctx.ellipse(p.sx,p.sy,C.BALL_R*p.scale*1.2*ss,C.BALL_R*p.scale*.42*ss,0,0,7);ctx.fill();
}

function drawBall(ctx,vp,state,assets){
  const b=state.ball,p=project(vp,vp.camera,b.x,b.y,b.z);if(!p)return;
  const r=Math.max(4,Math.min(26,C.BALL_R*p.scale));
  ctx.save();ctx.shadowColor='rgba(74,74,106,.2)';ctx.shadowBlur=r*.6;
  if(assets.images.ball)ctx.drawImage(assets.images.ball,p.sx-r,p.sy-r,r*2,r*2);
  else{const g=ctx.createRadialGradient(p.sx-r*.35,p.sy-r*.4,1,p.sx,p.sy,r);g.addColorStop(0,'#fff');g.addColorStop(.7,'#FFF2E8');g.addColorStop(1,'#FFD8C0');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.sx,p.sy,r,0,7);ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(p.sx-r*.32,p.sy-r*.34,r*.28,0,7);ctx.fill();}
  ctx.restore();
}

function drawViewmodel(ctx,vp,p,assets){
  const t=1-p.swingTime/C.SWING_TIME,swing=p.swingTime>0?Math.sin(Math.min(1,Math.max(0,t))*Math.PI):0,
    w=vp.w*(vp.w/vp.h<.85?.52:.42),h=vp.h*(vp.w/vp.h<.85?.45:.55),
    x=vp.x+vp.w-w*.72+swing*w*.08,y=vp.y+vp.h-h*.67-swing*h*.11;
  const img=assets.images[`${p.character}_${p.swingTime>0?'arm_swing':'arm'}`];
  if(img){ctx.drawImage(img,x,y,w,h);return;}
  ctx.save();ctx.translate(x+w*.6,y+h*.65);ctx.rotate(-.55-swing*.75);ctx.lineCap='round';
  const col=p.character==='boy'?C.COLORS.boy:C.COLORS.girl;
  ctx.strokeStyle=col;ctx.lineWidth=Math.max(26,w*.12);ctx.beginPath();ctx.moveTo(w*.3,h*.3);ctx.lineTo(w*.05,h*.02);ctx.stroke();
  ctx.strokeStyle='#FFDCBE';ctx.lineWidth=Math.max(20,w*.09);ctx.beginPath();ctx.moveTo(w*.08,h*.05);ctx.lineTo(-w*.12,-h*.15);ctx.stroke();
  ctx.lineWidth=Math.max(8,w*.03);ctx.strokeStyle='#4A4A6A';ctx.beginPath();ctx.moveTo(-w*.12,-h*.15);ctx.lineTo(-w*.24,-h*.3);ctx.stroke();
  const rg=ctx.createRadialGradient(-w*.32,-h*.4,3,-w*.29,-h*.36,w*.16);
  rg.addColorStop(0,'#FF7A6E');rg.addColorStop(1,'#E7524F');
  ctx.fillStyle=rg;ctx.strokeStyle='#4A4A6A';ctx.lineWidth=5;
  ctx.beginPath();ctx.ellipse(-w*.29,-h*.36,w*.1,h*.14,-.55,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(-w*.33,-h*.4,w*.03,h*.05,-.55,0,7);ctx.fill();
  ctx.restore();
}

function renderControls(ctx,vp,c){
  if(c.origin){
    ctx.fillStyle='rgba(255,255,255,.3)';ctx.strokeStyle='rgba(74,74,106,.3)';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(c.origin.x,c.origin.y,60,0,7);ctx.fill();ctx.stroke();
    const kg=ctx.createRadialGradient(c.knob.x-6,c.knob.y-6,2,c.knob.x,c.knob.y,25);
    kg.addColorStop(0,'#FFE9A8');kg.addColorStop(1,C.COLORS.accent);
    ctx.fillStyle=kg;ctx.beginPath();ctx.arc(c.knob.x,c.knob.y,25,0,7);ctx.fill();
  }
  ctx.fillStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.arc(vp.x+vp.w*.76,vp.h*.82,Math.min(vp.w,vp.h)*.09,0,7);ctx.fill();
  ctx.font=`800 ${Math.max(16,vp.w*.03)}px 'Jua',sans-serif`;ctx.textAlign='center';ctx.fillStyle='rgba(74,74,106,.4)';
  ctx.fillText('🏓',vp.x+vp.w*.76,vp.h*.835);
}

function renderParticles(ctx,vp,state){
  for(const p of state.particles){
    if(p.player!==vp.player&&p.screen)continue;
    let x,y;
    if(p.screen){x=vp.x+p.x*vp.w;y=p.y*vp.h;}
    else{const q=project(vp,vp.camera,p.x,p.y,p.z);if(!q)continue;x=q.sx;y=q.sy;}
    ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.font=`800 ${p.size}px sans-serif`;ctx.textAlign='center';
    if(p.shape==='text'||p.shape==='star')ctx.fillText(p.text||'★',x,y);
    else ctx.fillRect(x,y,p.size,p.size*.65);
  }
  ctx.globalAlpha=1;
  for(const b of state.bubbles){
    if(b.player!==vp.player)continue;
    const x=vp.x+vp.w*.5,y=vp.h*.25;
    ctx.fillStyle='#fff';ctx.strokeStyle=C.COLORS.girl;ctx.lineWidth=4;
    ctx.beginPath();ctx.roundRect(x-70,y-30,140,60,24);ctx.fill();ctx.stroke();
    ctx.fillStyle=C.COLORS.ink;ctx.font="800 26px 'Jua',sans-serif";ctx.textAlign='center';ctx.fillText(b.text,x,y+9);
  }
}
