import {C} from './config.js';
import {createGame,prepareServe} from './state.js';
import {stepPhysics} from './physics.js';
import {InputManager} from './input.js';
import {AIController} from './ai.js';
import {Assets} from './assets.js';
import {render} from './render.js';
import {handleEffect,updateEffects} from './effects.js';
import {UI} from './ui.js';

const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d',{alpha:false});
const assets=new Assets();let state=null,controllers=[],accumulator=0,last=performance.now(),gameMode=null,orientationBlocked=false;
const input=new InputManager(canvas,()=>gameMode);
const ui=new UI({start,pause,resume,rematch,home,mute});
assets.load();resize();addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,100));document.addEventListener('visibilitychange',()=>{last=performance.now();accumulator=0;if(document.hidden&&state)pause();});

function start(mode,p1,p2,difficulty){gameMode=mode;state=createGame(mode,p1,difficulty,p2);input.clear();controllers=[humanController(0),mode==='single'?new AIController(difficulty):humanController(1)];prepareServe(state);ui.score(state);ui.game();checkOrientation();last=performance.now();accumulator=0;}
function rematch(){if(!state)return;start(state.mode,state.players[0].character,state.mode==='versus_local'?state.players[1].character:null,state.difficulty);}
function home(){state=null;gameMode=null;controllers=[];input.clear();ui.orientation(false);}
function pause(){if(!state||state.status==='ended')return;state.paused=true;ui.pause();}
function resume(){if(!state)return;state.paused=false;last=performance.now();ui.resume();}
function mute(){ui.mute(assets.toggle());}
function resize(){const dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;ctx.setTransform(dpr,0,0,dpr,0,0);checkOrientation();}
function checkOrientation(){orientationBlocked=!!state&&state.mode==='versus_local'&&innerHeight>innerWidth;ui.orientation(orientationBlocked);}
function frame(now){requestAnimationFrame(frame);const elapsed=Math.min(.1,(now-last)/1000);last=now;if(!state){drawTitleBackdrop(now/1000);return;}input.tick(elapsed);if(state.paused||orientationBlocked){render(ctx,innerWidth,innerHeight,state,assets,input);return;}accumulator+=elapsed;let steps=0;const events=[];while(accumulator>=C.FIXED_DT&&steps<C.MAX_STEPS){const inputs=controllers.map(controller=>controller.update(state,C.FIXED_DT));stepPhysics(state,inputs,C.FIXED_DT,events);updateEffects(state,C.FIXED_DT);accumulator-=C.FIXED_DT;steps++;}if(steps===C.MAX_STEPS)accumulator=0;for(const e of events)processEvent(e);ui.serve(!state.ball.active&&state.status==='playing'&&state.pointDelay<=0&&state.server===0,state.totalPoints===0);render(ctx,innerWidth,innerHeight,state,assets,input);}
function humanController(index){return{update:()=>input.read(index)};}
function processEvent(e){handleEffect(state,e);if(e.type==='hit')assets.play('hit');if(e.type==='bounce')assets.play('bounce');if(e.type==='net')assets.play('net');if(e.type==='score'){assets.play(e.player===0?'score':'miss');ui.score(state);}if(e.type==='gameover'){assets.play(e.player===0?'win':'score');setTimeout(()=>state&&ui.result(state),700);}}
function drawTitleBackdrop(t){const g=ctx.createLinearGradient(0,0,0,innerHeight);g.addColorStop(0,C.COLORS.sky);g.addColorStop(1,'#FFF4D7');ctx.fillStyle=g;ctx.fillRect(0,0,innerWidth,innerHeight);ctx.fillStyle='rgba(255,255,255,.38)';for(let i=0;i<18;i++){const x=(i*137+Math.sin(t+i)*30)%innerWidth,y=(i*83+t*12)%innerHeight,r=7+i%4*3;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}}
requestAnimationFrame(frame);
