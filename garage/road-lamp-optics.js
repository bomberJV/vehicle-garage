// A segmented reflector has depth behind its rim. Each ring is its own surface;
// the clear weather cover is drawn separately in front of the completed lamp.
export function reflectorBowl(r,surface,radius,back,depth,lit,centerCap=true,tone={}){
  const panels=32,rings=4;
  const point=(j,i)=>{
    const a=i*Math.PI*2/panels,s=(.12+.88*j/rings)*radius;
    return surface(Math.cos(a)*s,Math.sin(a)*s,back+depth*(s/radius)**1.66);
  };
  for(let j=0;j<rings;j++)for(let i=0;i<panels;i++){
    const ca=Math.cos((i+.5)*Math.PI*2/panels),sa=Math.sin((i+.5)*Math.PI*2/panels);
    const illumination=.23+.56*(.5+.5*(sa*.83-ca*.5))+.14*(j/rings)+.045*(i%2);
    const base=lit?tone.litBase||[124,129,120]:[77,88,91],maximum=lit?tone.litMax||[246,245,223]:[204,218,218];
    const color='#'+base.map((c,k)=>Math.round(c+(maximum[k]-c)*illumination).toString(16).padStart(2,'0')).join('');
    r.polygon([point(j,i),point(j+1,i),point(j+1,i+1),point(j,i+1)],color,false);
  }
  if(!centerCap)return;
  const center=Array.from({length:20},(_,i)=>{const a=i*Math.PI/10;return surface(Math.cos(a)*radius*.115,Math.sin(a)*radius*.115,back+depth*.31);});
  r.polygon(center,lit?tone.litCap||'#f1e8ce':'#a2afb0',false);
}
