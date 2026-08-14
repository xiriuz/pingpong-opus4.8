import {C} from './config.js';
export function handleEffect(state,event){
  if(event.type==='hit'){burst(state,event.player,12,event.x,event.y,event.z,['♥','★','✦']);if(event.rally&&[3,5,8].includes(event.rally))state.bubbles.push({player:event.player,text:event.rally===3?'좋아!':event.rally===5?'멋져!':'최고야!',life:1.3});}
  if(event.type==='bounce')burst(state,event.z<0?0:1,6,event.x,event.y,event.z,['·','•']);
  if(event.type==='score')for(let i=0;i<34;i++)state.particles.push({screen:true,player:event.player,x:Math.random(),y:-.05,vx:(Math.random()-.5)*.45,vy:.22+Math.random()*.42,life:1.4+Math.random(),color:[C.COLORS.girl,C.COLORS.accent,C.COLORS.boy,'#fff'][i%4],shape:i%2?'rect':'star',size:5+Math.random()*7});
}
function burst(state,player,count,x,y,z,chars){for(let i=0;i<count;i++)state.particles.push({screen:false,player,x,y,z,vx:(Math.random()-.5)*.9,vy:.35+Math.random()*.7,vz:(Math.random()-.5)*.5,life:.55+Math.random()*.5,color:i%2?C.COLORS.girl:C.COLORS.accent,shape:'text',text:chars[i%chars.length],size:12+Math.random()*8});}
export function updateEffects(state,dt){for(const p of state.particles){p.life-=dt;if(p.screen){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.4*dt;}else{p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=1.1*dt;}}state.particles=state.particles.filter(p=>p.life>0).slice(-180);for(const b of state.bubbles)b.life-=dt;state.bubbles=state.bubbles.filter(b=>b.life>0);}
