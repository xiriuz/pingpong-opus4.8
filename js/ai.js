import {C} from './config.js';

export class AIController{
  constructor(level='easy'){this.level=level;this.think=0;this.servePulse=.5;}
  update(state,dt){
    const p=state.players[1],b=state.ball,cfg=C.DIFFICULTY[this.level];this.think-=dt;this.servePulse-=dt;
    if(!b.active){
      if(state.server===1&&this.servePulse<=0){this.servePulse=.6;return{moveX:0,moveZ:0,swing:{side:b.x<0?-1:1,dirX:(Math.random()-.5)*.5,dirY:0,power:.6}};}
      return{moveX:0,moveZ:0,swing:null};
    }
    const contactZ=p.z+C.LAUNCH.contactZ*(-p.side),coming=b.vz>0&&Math.abs(b.z-contactZ)<C.HIT_RADIUS*.95;
    if(coming&&this.think<=0){
      this.think=cfg.reaction+.4;   // 이번 공은 한 번만 판단
      const rubber=state.score[1]-state.score[0]>=3?1.4:1;
      if(Math.random()>=cfg.miss*rubber){
        const side=b.x<0?-1:1,spin=this.level==='easy'?0:(Math.random()-.5);
        return{moveX:0,moveZ:0,swing:{side,dirX:clamp((Math.random()-.5)*.7,-1,1),dirY:spin,power:.55+Math.random()*.2}};
      }
    }
    return{moveX:0,moveZ:0,swing:null};
  }
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
