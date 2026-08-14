export class InputManager{
  constructor(canvas,getMode){this.canvas=canvas;this.getMode=getMode;this.controls=[makeControl(),makeControl()];this.pointers=new Map();this.bind();}
  bind(){for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])this.canvas.addEventListener(type,e=>this.handle(e),{passive:false});}
  handle(e){e.preventDefault();const rect=this.canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,mode=this.getMode();const player=mode==='versus_local'?(x<rect.width/2?0:1):0;const vx0=mode==='versus_local'?player*rect.width/2:0,vw=mode==='versus_local'?rect.width/2:rect.width;const localX=x-vx0,kind=localX<vw/2?'move':'swing',c=this.controls[player];
    if(e.type==='pointerdown'){this.canvas.setPointerCapture?.(e.pointerId);const rec={player,kind,startX:x,startY:y,x,y,vw};this.pointers.set(e.pointerId,rec);if(kind==='move'){c.moveId=e.pointerId;c.origin={x,y};c.knob={x,y};}else if(c.swingId===null){c.swingId=e.pointerId;c.swing={dirX:0,dirY:0,power:.45};c.swingQueued=true;}}
    else {const rec=this.pointers.get(e.pointerId);if(!rec)return;rec.x=x;rec.y=y;if(e.type==='pointermove'){if(rec.kind==='move'){const dx=x-rec.startX,dy=y-rec.startY,d=Math.hypot(dx,dy),s=d>60?60/d:1;c.moveX=dx*s/60;c.moveZ=-dy*s/60;c.knob={x:rec.startX+dx*s,y:rec.startY+dy*s};}else{const max=Math.min(rec.vw,rect.height)*.25,dx=x-rec.startX,dy=y-rec.startY,p=Math.min(1,Math.hypot(dx,dy)/max);c.swing.dirX=clamp(dx/max,-1,1);c.swing.dirY=clamp(-dy/max,-1,1);c.swing.power=Math.max(.35,p);}}
      else{if(rec.kind==='move'&&c.moveId===e.pointerId){c.moveId=null;c.moveX=0;c.moveZ=0;c.origin=null;c.knob=null;}if(rec.kind==='swing'&&c.swingId===e.pointerId)c.swingId=null;this.pointers.delete(e.pointerId);}
    }
  }
  read(index){const c=this.controls[index],s=c.swingQueued?c.swing:null;c.swingQueued=false;return{moveX:c.moveX,moveZ:c.moveZ,swing:s};}
  visuals(index){return this.controls[index];}
  clear(){this.pointers.clear();this.controls=[makeControl(),makeControl()];}
}
function makeControl(){return{moveId:null,swingId:null,moveX:0,moveZ:0,origin:null,knob:null,swing:null,swingQueued:false};}const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
