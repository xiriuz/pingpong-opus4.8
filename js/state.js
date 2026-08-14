import {C} from './config.js';

export function createGame(mode,p1Character,difficulty='easy',p2Character=null){
  const second=p2Character||(p1Character==='boy'?'girl':'boy');
  return {
    mode,difficulty,status:'playing',time:0,score:[0,0],server:0,totalPoints:0,rally:0,bestRally:0,winner:null,message:'',
    players:[makePlayer(0,-1,p1Character,false),makePlayer(1,1,second,mode==='single')],
    ball:makeBall(),particles:[],bubbles:[],netWobble:0,scoreFlash:0,serveStage:0,serveTimer:0,pointDelay:0,paused:false
  };
}
// x는 항상 0으로 고정(이동 없음). z는 각자 진영 끝.
function makePlayer(index,side,character,isAI){return {index,side,character,isAI,x:0,z:side*2.05,swingTime:0,cooldown:0,swingSide:side<0?-1:1,swingShot:{dirX:0,dirY:0,power:.5},pose:'idle'};}
function makeBall(){return {x:0,y:.16,z:-1.75,vx:0,vy:0,vz:0,spin:{x:0,y:0,z:0},active:false,lastHit:null,bounces:[0,0],netChecked:false};}
export function prepareServe(state){
  const p=state.players[state.server],b=state.ball;
  Object.assign(b,{x:0,y:.16,z:p.z+C.LAUNCH.contactZ*(-p.side),vx:0,vy:0,vz:0,active:false,lastHit:null,bounces:[0,0],netChecked:false});
  b.spin={x:0,y:0,z:0};state.serveStage=0;state.serveTimer=0;state.pointDelay=0;state.rally=0;
}
export function isMatchWon(score,index){const other=score[1-index];return score[index]>=C.POINTS_TO_WIN&&score[index]-other>=C.WIN_BY;}
