import {C} from './config.js';
import {project,makeViewports} from './camera.js';
import {drawCharacter} from './characters.js';

const lerp=(a,b,t)=>a+(b-a)*t;
const HALFW=C.TABLE_W/2,HALFL=C.TABLE_L/2,NETX=C.TABLE_W/2+C.NET_OVERHANG;

export function render(ctx,width,height,state,assets,input){
  const vps=makeViewports(width,height,state);
  for(const vp of vps){ctx.save();ctx.beginPath();ctx.rect(vp.x,vp.y,vp.w,vp.h);ctx.clip();renderWorld(ctx,vp,state,assets);renderControls(ctx,vp,input.visuals(vp.player));renderParticles(ctx,vp,state);ctx.restore();}
  if(vps.length===2){ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(width/2-2,0,4,height);ctx.fillStyle='rgba(74,74,106,.12)';ctx.fillRect(width/2-4,0,2,height);}
  return vps;
}

function renderWorld(ctx,vp,state,assets){
  drawBackground(ctx,vp,state.time);
  const cam=vp.camera;
  drawTable(ctx,vp,cam);
  drawNet(ctx,vp,cam,state);
  const near=state.players[vp.player],far=state.players[1-vp.player];
  drawPlayer(ctx,vp,cam,far,assets);
  drawBall(ctx,vp,cam,state,assets);
  drawPlayer(ctx,vp,cam,near,assets);
}

function drawBackground(ctx,vp,time){
  const g=ctx.createLinearGradient(0,vp.y,0,vp.y+vp.h);
  g.addColorStop(0,'#E7F4FF');g.addColorStop(.5,'#FFF6EA');g.addColorStop(1,'#FFE6D2');
  ctx.fillStyle=g;ctx.fillRect(vp.x,vp.y,vp.w,vp.h);
  // 폭신한 물방울무늬
  ctx.fillStyle='rgba(255,255,255,.35)';
  for(let i=0;i<14;i++){const x=vp.x+((i*97+37)%vp.w),y=vp.y+((i*61+time*4)%vp.h),r=5+i%4*3;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
  // 부드러운 조명
  const rg=ctx.createRadialGradient(vp.x+vp.w/2,vp.y+vp.h*.42,vp.h*.1,vp.x+vp.w/2,vp.y+vp.h*.42,vp.h*.85);
  rg.addColorStop(0,'rgba(255,255,255,.28)');rg.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=rg;ctx.fillRect(vp.x,vp.y,vp.w,vp.h);
}

function drawTable(ctx,vp,cam){
  const c=[[-HALFW,0,-HALFL],[HALFW,0,-HALFL],[HALFW,0,HALFL],[-HALFW,0,HALFL]].map(p=>project(vp,cam,...p));
  if(c.some(x=>!x))return;
  // 바닥 그림자
  ctx.save();ctx.fillStyle='rgba(74,74,106,.16)';ctx.filter='blur(0px)';
  ctx.beginPath();ctx.moveTo(c[0].sx,c[0].sy+10);for(let i=1;i<4;i++)ctx.lineTo(c[i].sx,c[i].sy+14);ctx.closePath();ctx.fill();ctx.restore();
  // 상판 (노란 광택)
  const minY=Math.min(...c.map(p=>p.sy)),maxY=Math.max(...c.map(p=>p.sy));
  const tg=ctx.createLinearGradient(0,minY,0,maxY);
  tg.addColorStop(0,'#FFE59A');tg.addColorStop(.5,C.COLORS.table);tg.addColorStop(1,'#F2BE43');
  ctx.beginPath();ctx.moveTo(c[0].sx,c[0].sy);for(let i=1;i<4;i++)ctx.lineTo(c[i].sx,c[i].sy);ctx.closePath();
  ctx.fillStyle=tg;ctx.fill();
  ctx.lineJoin='round';ctx.strokeStyle='#E0A93C';ctx.lineWidth=Math.max(5,vp.w*.01);ctx.stroke();
  ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(3,vp.w*.006);ctx.stroke();
  // 반짝임
  ctx.save();ctx.clip();ctx.fillStyle='rgba(255,255,255,.16)';
  ctx.beginPath();ctx.ellipse((c[0].sx+c[1].sx)/2,minY+(maxY-minY)*.22,vp.w*.24,(maxY-minY)*.12,0,0,7);ctx.fill();ctx.restore();
  // 흰 라인 (가장자리 + 센터라인)
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=Math.max(2,vp.w*.004);
  const cl=[project(vp,cam,0,.002,-HALFL),project(vp,cam,0,.002,HALFL)];
  if(cl[0]&&cl[1]){ctx.beginPath();ctx.moveTo(cl[0].sx,cl[0].sy);ctx.lineTo(cl[1].sx,cl[1].sy);ctx.stroke();}
}

function drawNet(ctx,vp,cam,state){
  const lb=project(vp,cam,-NETX,0,0),rb=project(vp,cam,NETX,0,0),lt=project(vp,cam,-NETX,C.NET_H,0),rt=project(vp,cam,NETX,C.NET_H,0);
  if(!lb||!rb||!lt||!rt)return;
  const wob=Math.sin(state.time*30)*state.netWobble*4;
  // 그물
  ctx.fillStyle='rgba(255,255,255,.7)';
  ctx.beginPath();ctx.moveTo(lt.sx,lt.sy+wob);ctx.lineTo(rt.sx,rt.sy-wob);ctx.lineTo(rb.sx,rb.sy);ctx.lineTo(lb.sx,lb.sy);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(74,74,106,.28)';ctx.lineWidth=1;
  for(let i=0;i<=16;i++){const t=i/16;ctx.beginPath();ctx.moveTo(lerp(lt.sx,rt.sx,t),lerp(lt.sy+wob,rt.sy-wob,t));ctx.lineTo(lerp(lb.sx,rb.sx,t),lerp(lb.sy,rb.sy,t));ctx.stroke();}
  for(let i=0;i<=3;i++){const t=i/3;ctx.beginPath();ctx.moveTo(lerp(lt.sx,lb.sx,t),lerp(lt.sy+wob,lb.sy,t));ctx.lineTo(lerp(rt.sx,rb.sx,t),lerp(rt.sy-wob,rb.sy,t));ctx.stroke();}
  // 윗 흰띠 + 기둥
  ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(4,vp.w*.008);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(lt.sx,lt.sy+wob);ctx.lineTo(rt.sx,rt.sy-wob);ctx.stroke();
  ctx.strokeStyle='#D94C68';ctx.lineWidth=Math.max(4,vp.w*.009);
  ctx.beginPath();ctx.moveTo(lb.sx,lb.sy);ctx.lineTo(lt.sx,lt.sy+wob);ctx.moveTo(rb.sx,rb.sy);ctx.lineTo(rt.sx,rt.sy-wob);ctx.stroke();
}

function drawPlayer(ctx,vp,cam,p,assets){
  const base=project(vp,cam,p.x,0,p.z);if(!base)return;
  const size=vp.h*.33*base.scale;
  const img=assets.images[`${p.character}_${p.pose}`]||assets.images[`${p.character}_idle`];
  const cx=base.sx,cy=base.sy-size*.36;
  if(img){ctx.drawImage(img,cx-size*.4,cy-size*.5,size*.8,size);return;}
  drawCharacter(ctx,p.character,cx,cy,size,p.pose,false);
}

function drawBall(ctx,vp,cam,state,assets){
  const b=state.ball;
  const sh=project(vp,cam,b.x,0,b.z);
  if(sh){const ss=1+b.y*.5,al=Math.max(.05,.26/(1+b.y*1.4));ctx.fillStyle=`rgba(74,74,106,${al})`;
    ctx.beginPath();ctx.ellipse(sh.sx,sh.sy,Math.max(4,vp.h*.018*sh.scale)*ss,Math.max(2,vp.h*.009*sh.scale)*ss,0,0,7);ctx.fill();}
  const p=project(vp,cam,b.x,b.y,b.z);if(!p)return;
  const r=Math.max(5,vp.h*.02*p.scale);
  ctx.save();ctx.shadowColor='rgba(74,74,106,.2)';ctx.shadowBlur=r*.6;
  if(assets.images.ball)ctx.drawImage(assets.images.ball,p.sx-r,p.sy-r,r*2,r*2);
  else{const g=ctx.createRadialGradient(p.sx-r*.35,p.sy-r*.4,1,p.sx,p.sy,r);g.addColorStop(0,'#fff');g.addColorStop(.7,'#FFF2E8');g.addColorStop(1,'#FFD8C0');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.sx,p.sy,r,0,7);ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(p.sx-r*.32,p.sy-r*.34,r*.28,0,7);ctx.fill();}
  ctx.restore();
}

function renderControls(ctx,vp,c){
  const zy=vp.y+vp.h*.9,r=Math.min(vp.w*.17,vp.h*.1);
  const zones=[{cx:vp.x+vp.w*.15,label:'백핸드',side:-1},{cx:vp.x+vp.w*.85,label:'포핸드',side:1}];
  for(const z of zones){
    const active=c&&c.pressSide===z.side&&c.pressTime>0;
    ctx.fillStyle=active?'rgba(255,216,110,.55)':'rgba(255,255,255,.2)';
    ctx.strokeStyle=active?'rgba(231,82,79,.9)':'rgba(74,74,106,.25)';ctx.lineWidth=active?6:3;
    ctx.beginPath();ctx.arc(z.cx,zy,r,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(74,74,106,.6)';ctx.textAlign='center';
    ctx.font=`800 ${Math.max(15,vp.w*.03)}px 'Jua',sans-serif`;ctx.fillText('🏓',z.cx,zy-r*.05);
    ctx.font=`800 ${Math.max(12,vp.w*.024)}px 'Jua',sans-serif`;ctx.fillText(z.label,z.cx,zy+r*.55);
  }
}

function renderParticles(ctx,vp,state){
  for(const p of state.particles){
    if(p.player!==vp.player&&p.screen)continue;
    let x,y;
    if(p.screen){x=vp.x+p.x*vp.w;y=vp.y+p.y*vp.h;}
    else{const q=project(vp,vp.camera,p.x,p.y,p.z);if(!q)continue;x=q.sx;y=q.sy;}
    ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.font=`800 ${p.size}px sans-serif`;ctx.textAlign='center';
    if(p.shape==='text'||p.shape==='star')ctx.fillText(p.text||'★',x,y);
    else ctx.fillRect(x,y,p.size,p.size*.65);
  }
  ctx.globalAlpha=1;
  for(const b of state.bubbles){
    if(b.player!==vp.player)continue;
    const x=vp.x+vp.w*.5,y=vp.y+vp.h*.3;
    ctx.fillStyle='#fff';ctx.strokeStyle=C.COLORS.girl;ctx.lineWidth=4;
    ctx.beginPath();ctx.roundRect(x-70,y-30,140,60,24);ctx.fill();ctx.stroke();
    ctx.fillStyle=C.COLORS.ink;ctx.font="800 26px 'Jua',sans-serif";ctx.textAlign='center';ctx.fillText(b.text,x,y+9);
  }
}
