const IMAGE_NAMES=['boy_arm','boy_arm_swing','boy_idle','boy_swing','boy_win','boy_face','girl_arm','girl_arm_swing','girl_idle','girl_swing','girl_win','girl_face','table_top','net','ball','background','logo','effect_hit'];
const SOUND_NAMES=['hit','bounce','net','score','miss','win'];
export class Assets{
  constructor(){this.images={};this.sounds={};this.muted=false;}
  async load(){await Promise.all(IMAGE_NAMES.map(async n=>{this.images[n]=await loadImage(`assets/${n}.png`)}));for(const n of SOUND_NAMES){const a=new Audio(`assets/sounds/${n}.mp3`);a.preload='none';this.sounds[n]=a;}}
  play(name){if(this.muted)return;const a=this.sounds[name];if(a)a.cloneNode().play().catch(()=>{});}
  toggle(){this.muted=!this.muted;return this.muted;}
}
export function loadImage(path){return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=path;});}
