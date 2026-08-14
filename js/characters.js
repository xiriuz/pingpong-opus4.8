import {C} from './config.js';

export const CHARACTERS={
  boy:{id:'boy',name:'뾰족머리',color:C.COLORS.boy},
  girl:{id:'girl',name:'긴머리',color:C.COLORS.girl}
};

// 팔레트 — 스케치의 색을 최대한 살림
const PAL={
  skin:'#FFE1C6', skinSh:'#F3C3A0', ink:'#4A4A6A', cheek:'#FF9DB0',
  boyHair:'#4A3A2C', boyHair2:'#6B5340', boyTop:'#7EC8F0', boyTopSh:'#5BA9DA', boyPants:'#4C8FD6',
  girlHair:'#7A5540', girlHair2:'#9A7458', girlDress:'#B98CD8', girlDressSh:'#9C6FC0', bow:'#FF8FB1',
  paddle:'#E7524F', paddleSh:'#C63C3F', handle:'#D79A5E', handleSh:'#B87C42'
};

// 부드러운 다각형 헬퍼
function blob(ctx,pts,close=true){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);if(close)ctx.closePath();}

// 라켓 (빨간 원, 나무 손잡이)
function drawPaddle(ctx,x,y,rot,scale=1){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(scale,scale);
  ctx.fillStyle=PAL.handle;ctx.strokeStyle=PAL.ink;ctx.lineWidth=4.5;
  ctx.beginPath();ctx.roundRect(-6,10,12,30,6);ctx.fill();ctx.stroke();
  const g=ctx.createRadialGradient(-5,-8,3,0,0,24);
  g.addColorStop(0,'#FF7A6E');g.addColorStop(1,PAL.paddle);
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,-6,20,23,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(-7,-13,6,8,-.4,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// 발그레한 볼 + 반짝이는 눈 + 웃는 입
function drawFace(ctx,mouthOpen){
  ctx.fillStyle=PAL.cheek;ctx.globalAlpha=.55;
  ctx.beginPath();ctx.arc(-17,-38,7,0,Math.PI*2);ctx.arc(17,-38,7,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  ctx.fillStyle=PAL.ink;
  ctx.beginPath();ctx.ellipse(-11,-46,3.4,4.4,0,0,Math.PI*2);ctx.ellipse(11,-46,3.4,4.4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(-9.6,-47.6,1.3,0,Math.PI*2);ctx.arc(12.4,-47.6,1.3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=PAL.ink;ctx.lineWidth=4;ctx.lineCap='round';
  if(mouthOpen){
    ctx.fillStyle='#E5686E';ctx.beginPath();ctx.arc(0,-31,8,.12,Math.PI-.12);ctx.fill();
    ctx.beginPath();ctx.arc(0,-31,8,.12,Math.PI-.12);ctx.stroke();
  }else{
    ctx.beginPath();ctx.arc(0,-33,7,.2,Math.PI-.2);ctx.stroke();
  }
}

export function drawCharacter(ctx,id,x,y,size,pose='idle',flip=false){
  const c=CHARACTERS[id],s=size/200;
  const bounce=pose==='win'?-10:0;
  const armUp=pose==='swing'||pose==='win';
  ctx.save();ctx.translate(x,y+bounce);if(flip)ctx.scale(-1,1);ctx.scale(s,s);
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=PAL.ink;ctx.lineWidth=5;

  // ── 다리 ──
  ctx.strokeStyle=PAL.ink;ctx.lineWidth=11;
  ctx.beginPath();ctx.moveTo(-13,60);ctx.lineTo(-15,98);ctx.moveTo(13,60);ctx.lineTo(15,98);ctx.stroke();
  ctx.fillStyle=id==='boy'?'#FF8F5E':'#FF8FB1';ctx.lineWidth=4;
  ctx.beginPath();ctx.ellipse(-16,101,9,6,0,0,Math.PI*2);ctx.ellipse(16,101,9,6,0,0,Math.PI*2);ctx.fill();ctx.stroke();

  // ── 뒷머리(소녀) ──
  if(id==='girl'){
    ctx.fillStyle=PAL.girlHair;ctx.strokeStyle=PAL.ink;ctx.lineWidth=5;
    blob(ctx,[[-36,-74],[-52,-40],[-44,28],[-24,14],[24,14],[46,30],[54,-42],[34,-74]]);
    ctx.fill();ctx.stroke();
  }

  // ── 몸/옷 ──
  ctx.lineWidth=5;
  if(id==='boy'){
    const g=ctx.createLinearGradient(0,6,0,64);g.addColorStop(0,PAL.boyTop);g.addColorStop(1,PAL.boyTopSh);
    ctx.fillStyle=g;ctx.strokeStyle=PAL.ink;
    blob(ctx,[[-30,10],[-33,60],[33,60],[30,10]]);ctx.fill();ctx.stroke();
    ctx.fillStyle=PAL.boyPants;
    blob(ctx,[[-31,54],[-30,72],[-3,66],[3,66],[30,72],[31,54]]);ctx.fill();ctx.stroke();
  }else{
    const g=ctx.createLinearGradient(0,6,0,72);g.addColorStop(0,PAL.girlDress);g.addColorStop(1,PAL.girlDressSh);
    ctx.fillStyle=g;ctx.strokeStyle=PAL.ink;
    blob(ctx,[[-24,8],[-46,70],[46,70],[24,8]]);ctx.fill();ctx.stroke();
    ctx.fillStyle=PAL.bow;ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(-10,20);ctx.lineTo(0,17);ctx.lineTo(10,20);ctx.closePath();ctx.fill();ctx.stroke();
  }

  // ── 왼팔 ──
  ctx.strokeStyle=PAL.ink;ctx.lineWidth=9;
  ctx.beginPath();ctx.moveTo(-24,20);ctx.lineTo(-46,44);ctx.stroke();
  ctx.fillStyle=PAL.skin;ctx.lineWidth=4;ctx.beginPath();ctx.arc(-48,46,6.5,0,Math.PI*2);ctx.fill();ctx.stroke();

  // ── 오른팔 + 라켓 ──
  ctx.strokeStyle=PAL.ink;ctx.lineWidth=9;
  if(armUp){
    ctx.beginPath();ctx.moveTo(24,20);ctx.lineTo(50,-6);ctx.stroke();
    ctx.fillStyle=PAL.skin;ctx.beginPath();ctx.arc(52,-8,6.5,0,Math.PI*2);ctx.fill();ctx.lineWidth=4;ctx.stroke();
    drawPaddle(ctx,64,-26,.5,1);
  }else{
    ctx.beginPath();ctx.moveTo(24,22);ctx.lineTo(50,34);ctx.stroke();
    ctx.fillStyle=PAL.skin;ctx.beginPath();ctx.arc(52,36,6.5,0,Math.PI*2);ctx.fill();ctx.lineWidth=4;ctx.stroke();
    drawPaddle(ctx,66,44,.9,.92);
  }

  // ── 목 ──
  ctx.fillStyle=PAL.skin;ctx.strokeStyle=PAL.ink;ctx.lineWidth=4;
  ctx.beginPath();ctx.roundRect(-6,-6,12,14,4);ctx.fill();ctx.stroke();

  // ── 얼굴 ──
  ctx.fillStyle=PAL.skin;ctx.lineWidth=5;
  ctx.beginPath();ctx.roundRect(-31,-78,62,68,28);ctx.fill();ctx.stroke();

  // ── 앞머리 ──
  if(id==='boy'){
    const g=ctx.createLinearGradient(0,-92,0,-52);g.addColorStop(0,PAL.boyHair2);g.addColorStop(1,PAL.boyHair);
    ctx.fillStyle=g;ctx.strokeStyle=PAL.ink;ctx.lineWidth=4.5;
    blob(ctx,[[-32,-58],[-31,-82],[-19,-72],[-9,-92],[2,-73],[14,-93],[22,-71],[32,-82],[31,-56],[0,-66]]);
    ctx.fill();ctx.stroke();
  }else{
    const g=ctx.createLinearGradient(0,-92,0,-54);g.addColorStop(0,PAL.girlHair2);g.addColorStop(1,PAL.girlHair);
    ctx.fillStyle=g;ctx.strokeStyle=PAL.ink;ctx.lineWidth=4.5;
    blob(ctx,[[-33,-54],[-35,-84],[-6,-94],[26,-88],[35,-60],[24,-70],[6,-78],[2,-64],[-6,-76],[-20,-70],[-30,-58]]);
    ctx.fill();ctx.stroke();
    ctx.fillStyle=PAL.girlHair;ctx.beginPath();ctx.ellipse(44,-40,12,20,.5,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=PAL.bow;ctx.beginPath();ctx.arc(36,-58,6,0,Math.PI*2);ctx.fill();ctx.stroke();
  }

  // ── 표정 ──
  drawFace(ctx,pose==='win');

  // ── 승리 반짝임 ──
  if(pose==='win'){
    ctx.fillStyle=C.COLORS.accent;ctx.font='800 26px sans-serif';ctx.textAlign='center';
    ctx.fillText('✨',-58,-60);ctx.fillText('✨',60,-70);
    ctx.strokeStyle=PAL.ink;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-24,20);ctx.lineTo(-50,-8);ctx.stroke();
    ctx.fillStyle=PAL.skin;ctx.lineWidth=4;ctx.beginPath();ctx.arc(-52,-10,6.5,0,Math.PI*2);ctx.fill();ctx.stroke();
  }

  ctx.restore();
}
