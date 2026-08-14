import {C} from './config.js';
import {prepareServe,isMatchWon} from './state.js';

export function stepPhysics(state,inputs,dt,events){
  state.time+=dt;state.netWobble=Math.max(0,state.netWobble-dt*4);state.scoreFlash=Math.max(0,state.scoreFlash-dt);
  for(let i=0;i<2;i++)updatePlayer(state,state.players[i],inputs[i],dt,events);
  if(state.pointDelay>0){state.pointDelay-=dt;if(state.pointDelay<=0&&state.status==='playing')prepareServe(state);return;}
  if(!state.ball.active){const p=state.players[state.server];state.ball.x=0;state.ball.z=p.z+C.LAUNCH.contactZ*(-p.side);state.ball.y=.16;return;}

  const b=state.ball,oldZ=b.z,bdt=dt*C.BALL_TIME;   // 공만 슬로우 모션 (4~5배 느리게)
  const a=cross(b.spin,{x:b.vx,y:b.vy,z:b.vz});
  b.vx+=C.MAGNUS_K*a.x*bdt;b.vy+=(-C.GRAVITY+C.MAGNUS_K*a.y)*bdt;b.vz+=C.MAGNUS_K*a.z*bdt;
  b.x+=b.vx*bdt;b.y+=b.vy*bdt;b.z+=b.vz*bdt;

  if(!b.netChecked&&oldZ*b.z<=0){b.netChecked=true;if(b.y-C.BALL_R<C.NET_H&&Math.abs(b.x)<C.TABLE_W/2+C.NET_OVERHANG){b.vx*=.15;b.vz*=.15;b.vy=-Math.abs(b.vy)*.2;state.netWobble=1;events.push({type:'net',x:b.x,y:b.y,z:0});awardPoint(state,1-(b.lastHit??state.server),events,'삐끗!');return;}}
  if(b.y<=C.BALL_R&&b.vy<0){
    const onTable=Math.abs(b.x)<=C.TABLE_W/2&&Math.abs(b.z)<=C.TABLE_L/2;
    if(onTable){b.y=C.BALL_R;b.vy=-b.vy*C.RESTITUTION;b.vz+=b.spin.x*C.TABLE_FRICTION*.004;b.vx-=b.spin.y*C.TABLE_FRICTION*.004;b.spin.x*=.7;b.spin.y*=.7;b.spin.z*=.7;const side=b.z<0?0:1;b.bounces[side]++;events.push({type:'bounce',x:b.x,y:0,z:b.z});if(b.bounces[side]>=2){awardPoint(state,1-side,events,'통통!');return;}}
    else if(b.lastHit!==null){const opponent=1-b.lastHit;awardPoint(state,b.bounces[opponent]>0?b.lastHit:opponent,events,'아깝다!');return;}
  }
  if(b.y<-.9||Math.abs(b.z)>4.1||Math.abs(b.x)>3){const scorer=b.lastHit!==null&&b.bounces[1-b.lastHit]>0?b.lastHit:1-(b.lastHit??state.server);awardPoint(state,scorer,events,'한 번 더 해보자!');}
}

function updatePlayer(state,p,input,dt,events){
  p.cooldown=Math.max(0,p.cooldown-dt);p.swingTime=Math.max(0,p.swingTime-dt);p.pose=p.swingTime>0?'swing':'idle';
  if(input.swing&&p.cooldown<=0){
    p.swingTime=C.SWING_TIME;p.cooldown=C.SWING_TIME+C.SWING_COOLDOWN;p.swingShot=input.swing;p.swingSide=input.swing.side||1;
    events.push({type:'swing',player:p.index});
    if(!state.ball.active&&p.index===state.server)launchServe(state,p,input.swing,events);
  }
  if(state.ball.active&&p.swingTime>0&&state.ball.lastHit!==p.index){
    const b=state.ball,side=p.swingSide;
    const loX=side<0?-C.REACH:-.18,hiX=side<0?.18:C.REACH;          // 백핸드=왼쪽, 포핸드=오른쪽
    const contactZ=p.z+C.LAUNCH.contactZ*(-p.side),approaching=p.side<0?b.vz<0:b.vz>0;
    if(approaching&&b.x>=loX&&b.x<=hiX&&Math.abs(b.z-contactZ)<C.HIT_RADIUS&&b.y<.6)hitBall(state,p,p.swingShot,events);
  }
}

function launchServe(state,p,shot,events){const b=state.ball;state.serveStage=2;b.active=true;b.lastHit=p.index;b.bounces=[0,0];b.netChecked=false;aimVelocity(b,p,shot,true);events.push({type:'hit',player:p.index,x:b.x,y:b.y,z:b.z});}
function hitBall(state,p,shot,events){const b=state.ball;b.lastHit=p.index;b.bounces=[0,0];b.netChecked=false;aimVelocity(b,p,shot,false);state.rally++;state.bestRally=Math.max(state.bestRally,state.rally);events.push({type:'hit',player:p.index,x:b.x,y:b.y,z:b.z,rally:state.rally});}
function aimVelocity(b,p,shot,isServe){
  const L=C.LAUNCH,power=.85+.3*clamp(shot.power||0,0,1);
  const targetX=clamp((shot.dirX||0)*.55,-.6,.6),targetZ=p.side<0?1.0:-1.0,travel=isServe?L.serveTravel:L.rallyTravel;
  const rawVx=(targetX-b.x)/travel,rawVz=(targetZ-b.z)/travel;
  b.vx=lerp(rawVx,rawVx+(shot.dirX||0)*1.6,1-C.AIM_ASSIST)*power;b.vz=rawVz*power;
  const vertical=(shot.dirY||0);b.vy=(isServe?L.serveVy:L.rallyVy)-vertical*.35;
  b.spin.x=clamp(vertical*C.MAX_SPIN,-C.MAX_SPIN,C.MAX_SPIN);b.spin.y=clamp((shot.dirX||0)*C.MAX_SPIN,-C.MAX_SPIN,C.MAX_SPIN);b.spin.z=0;
}
function awardPoint(state,index,events,message){
  if(state.status!=='playing')return;state.ball.active=false;state.score[index]++;state.totalPoints++;state.scoreFlash=.55;events.push({type:'score',player:index,message});
  if(isMatchWon(state.score,index)){state.status='ended';state.winner=index;events.push({type:'gameover',player:index});return;}
  state.server=Math.floor(state.totalPoints/C.SERVE_SWITCH)%2;state.pointDelay=.65;
}
function cross(a,b){return{x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x};}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const lerp=(a,b,t)=>a+(b-a)*t;
