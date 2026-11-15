import {tint} from './road-primitives.js';

// Revolve a cross section in order. Adjacent bands share each station exactly,
// so the inset bead and shoulders remain continuous as the camera moves.
function turnProfile(r,x,y,z,profile){
  const count=48;
  const circle=Array.from({length:count},(_,k)=>{
    const angle=2*Math.PI*k/count;
    return [Math.cos(angle),Math.sin(angle)];
  });
  const ring=([station,radius])=>circle.map(([c,s])=>[x+radius*c,y+station,z+radius*s]);
  let previous=ring(profile[0]);
  for(let i=1;i<profile.length;i++){
    const next=ring(profile[i]),color=profile[i][2];
    for(let k=0;k<count;k++){
      const j=(k+1)%count;
      r.polygon([previous[k],next[k],next[j],previous[j]],color,false);
    }
    previous=next;
  }
}

function drawTire(r,x,y,z,spec){
  const h=spec.sectionWidth*spec.aspect,bead=spec.beadRadius,half=spec.sectionWidth/2;
  // The manufacturer's size gives crown diameter, nominal section width and
  // bead seat. The sidewall bulge, shoulders and two tread grooves are schematic.
  const halfSection=[
    [spec.beadWidth/2,bead,'#262c2d'],[spec.beadWidth/2+.009,bead+.016,'#303638'],
    [half*.954,bead+h*.32,'#252b2c'],[half,bead+h*.54,'#252a2c'],
    [half*.975,bead+h*.75,'#2b3032'],[half*.877,bead+h*.91,'#2c3233'],
    [half*.73,bead+h*.994,'#303637'],[half*.52,bead+h,'#2a3031'],
    [half*.46,bead+h-.004,'#1e2425'],[half*.40,bead+h,'#323839']
  ];
  const section=halfSection.map(([w,a,color])=>[-w,a,color]);
  for(let i=halfSection.length-1;i>=0;i--){
    const [w,a]=halfSection[i];
    const color=halfSection[Math.min(i+1,halfSection.length-1)][2];
    section.push([w,a,color]);
  }
  turnProfile(r,x,y,z,section);
}

export function sectionedWheel(r,{x,y,z,side,finish},spec,stockOffset,drawFace){
  const center=y+side*(stockOffset-spec.offset);
  const bead=spec.beadRadius,half=spec.beadWidth/2,flange=bead+.011;
  r.tag('wheels.tire',()=>drawTire(r,x,center,z,spec));
  r.tag('wheels.rim',()=>{
    // Both bead seats come from the size designation. Flanges, drop center
    // and inflated shoulder contours are schematic.
    const profile=[
      [-half-.007,bead-.013],[-half-.007,flange],[-half,bead],
      [-half+.017,bead],[-half+.034,bead-.009],[-half+.046,bead-.022],
      [half-.041,bead-.022],[half-.030,bead-.009],[half-.017,bead],
      [half,bead],[half+.007,flange],[half+.007,bead-.013],
      [half-.028,bead-.019],[-half+.041,bead-.027],[-half-.007,bead-.013]
    ];
    turnProfile(r,x,center,z,profile.map(([w,a],i)=>[w,a,tint(finish,i===1||i===11?1.12:i<11?.88:.69)]));
    const pad=y+side*stockOffset;
    const spoke=center+side*(half-.018);
    r.ringY(x,pad,z,.078,.040,tint(finish,.66),32);
    r.tubeY(x,pad,spoke,z,.078,tint(finish,.79),32);
    r.tubeY(x,pad,spoke,z,.040,tint(finish,.62),32);
    drawFace(r,{x,y:spoke,z,side,rim:bead,finish});
  });
}
