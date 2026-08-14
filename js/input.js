// 움직임 없음. 화면 왼쪽 탭 = 백핸드, 오른쪽 탭 = 포핸드.
export class InputManager{
  constructor(canvas,getMode){this.canvas=canvas;this.getMode=getMode;this.controls=[makeControl(),makeControl()];this.pointers=new Map();this.bind();}
  bind(){for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])this.canvas.addEventListener(type,e=>this.handle(e),{passive:false});}
  handle(e){
    e.preventDefault();
    const rect=this.canvas.getBoundingClientRect(),x=e.clientX-rect.left,mode=this.getMode();
    const player=mode==='versus_local'?(x<rect.width/2?0:1):0;
    const half0=mode==='versus_local'?player*rect.width/2:0,halfW=mode==='versus_local'?rect.width/2:rect.width;
    const localX=x-half0,side=localX<halfW/2?-1:1;   // -1 백핸드(왼), +1 포핸드(오른)
    const c=this.controls[player];
    if(e.type==='pointerdown'){
      this.canvas.setPointerCapture?.(e.pointerId);
      this.pointers.set(e.pointerId,{player,side});
      c.swingQueued=true;c.swing={side,dirX:side*.25,dirY:0,power:.6};
      c.pressSide=side;c.pressTime=.18;
    }else if(e.type==='pointerup'||e.type==='pointercancel'){this.pointers.delete(e.pointerId);}
  }
  read(index){const c=this.controls[index],s=c.swingQueued?c.swing:null;c.swingQueued=false;return{moveX:0,moveZ:0,swing:s};}
  tick(dt){for(const c of this.controls)if(c.pressTime>0)c.pressTime=Math.max(0,c.pressTime-dt);}
  visuals(index){return this.controls[index];}
  clear(){this.pointers.clear();this.controls=[makeControl(),makeControl()];}
}
function makeControl(){return{swing:null,swingQueued:false,pressSide:0,pressTime:0};}
