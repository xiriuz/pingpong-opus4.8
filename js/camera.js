// 위에서 내려다보는 탑다운 뷰 (스케치 구도). 화면 세로축=테이블 길이(z), 가로축=x, 공의 높이 y는 살짝 떠 보이게.
const Z_LO=-2.5,Z_HI=2.5,TOP_SHRINK=.66,X_SCALE=.47,Y_TOP=.17,Y_BOT=.9,HEIGHT_LIFT=.2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;

export function makeCamera(player){return{flip:false,side:player?player.side:-1};}

export function makeViewports(width,height,state){
  const count=state.mode==='versus_local'?2:1;
  return Array.from({length:count},(_,i)=>{
    const w=width/count,h=height,vp={x:i*w,y:0,w,h,player:i};
    vp.camera={flip:count===2&&i===1,side:state.players[i].side};
    return vp;
  });
}

// 월드(wx 좌우, wy 높이, wz 길이) → 화면
export function project(vp,cam,wx,wy,wz){
  if(cam.flip){wx=-wx;wz=-wz;}
  const t=clamp((wz-Z_LO)/(Z_HI-Z_LO),0,1);   // 0 아래(가까움) .. 1 위(멀다)
  const wf=lerp(1,TOP_SHRINK,t);               // 멀수록 좁고 작게
  const sx=vp.x+vp.w/2+wx*(vp.w*X_SCALE)*wf;
  let sy=vp.y+lerp(vp.h*Y_BOT,vp.h*Y_TOP,t);
  sy-=wy*(vp.h*HEIGHT_LIFT)*wf;                // 높이는 화면 위로 띄움
  return{sx,sy,scale:wf,depth:t};
}
