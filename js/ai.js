import {C} from './config.js';

export class AIController{
  constructor(level='easy'){this.level=level;this.think=0;this.targetX=0;this.miss=false;this.servePulse=0;}
  update(state,dt){
    const p=state.players[1],b=state.ball,cfg=C.DIFFICULTY[this.level];this.think-=dt;let swing=null;
    if(!b.active&&state.server===1){this.servePulse-=dt;if(this.servePulse<=0){swing={dirX:(Math.random()-.5)*.5,dirY:0,power:.55};this.servePulse=.62;}return{moveX:0,moveZ:0,swing};}
    if(this.think<=0){this.think=cfg.reaction;this.targetX=b.x+(Math.random()*2-1)*cfg.error;const rubber=state.score[1]-state.score[0]>=3?1.5:1;this.miss=Math.random()<cfg.miss*rubber;}
    let moveX=this.miss?0:clamp((this.targetX-p.x)*2.4,-1,1),moveZ=0;
    const coming=b.active&&b.vz>0&&b.z>.72;if(coming&&!this.miss&&Math.abs(b.x-p.x)<C.HIT_RADIUS*.9&&b.z>1.45&&b.z<2.55&&b.y<.52){const spin=this.level==='easy'?0:(Math.random()-.5)*1.2;swing={dirX:clamp((Math.random()-.5)*.8,-1,1),dirY:spin,power:.55+Math.random()*.25};this.think=cfg.reaction;}
    return{moveX,moveZ,swing};
  }
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
